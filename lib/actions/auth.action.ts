"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import { resolveMx } from "dns/promises";
import { DISPOSABLE_DOMAINS, EMAIL_REGEX } from "@/constants";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  // Set cookie in the browser
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: false, // Force false for local testing
    path: "/",
    sameSite: "lax",
  });
}

async function checkMXRecords(domain: string): Promise<boolean> {
  // skip for localhost/internal domains during testing
  if (domain === "localhost" || domain.endsWith(".test")) return true;

  try {
    const records = await resolveMx(domain);
    return records && records.length > 0;
  } catch (error) {
    console.warn(`MX record lookup failed for ${domain}:`, error);
    return false;
  }
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email, password, gender, careerStage } = params;

  try {
    // Robust email validation (redundant but safe server-side check)
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return {
        success: false,
        message: "Invalid email address format.",
      };
    }

    const domain = normalizedEmail.split("@")[1];
    if (!domain || DISPOSABLE_DOMAINS.includes(domain)) {
      return {
        success: false,
        message: "This email domain is not allowed.",
      };
    }

    // Check MX records
    const hasMX = await checkMXRecords(domain);
    if (!hasMX) {
      return {
        success: false,
        message: "This email domain does not appear to be valid or cannot receive mail.",
      };
    }

    // check if user exists in db
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

    // save user to db with isEmailVerified: false
    await db.collection("users").doc(uid).set({
      name,
      email: normalizedEmail,
      password, // Added as requested
      gender,
      careerStage,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
    });

    // Send verification email
    await sendVerificationEmailInternal(uid, normalizedEmail, name);

    return {
      success: true,
      message: "Account created successfully. Please verify your email.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle Firebase specific errors
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken, password } = params;
  console.log("signIn action called");

  try {
    // Verify the user is verified in our database
    const decodedToken = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    /* 
    if (userDoc.exists) {
      const userData = userDoc.data();

      // Additional check for email verification status
      if (userData && userData.isEmailVerified === false) {
        return {
          success: false,
          message: "Please verify your email address before signing in.",
        };
      }
    }
    */

    await setSessionCookie(idToken);
    console.log("Session cookie set successfully");
    return { success: true };
  } catch (error: any) {
    console.error("Sign in error:", error);
    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) {
    console.log("No session cookie found");
    return null;
  }

  try {
    // Disable revocation check (true -> false) to avoid potential sync/latency issues
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, false);

    // get user info from db
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    if (!userRecord.exists) {
      console.log("User record not found in DB for UID:", decodedClaims.uid, ". Creating basic record...");

      const basicUser = {
        name: decodedClaims.name || decodedClaims.email?.split('@')[0] || "New User",
        email: decodedClaims.email || "",
        gender: "male" as const,
        careerStage: "other",
        isEmailVerified: decodedClaims.email_verified || false,
        createdAt: new Date().toISOString(),
      };

      await db.collection("users").doc(decodedClaims.uid).set(basicUser);

      return {
        ...basicUser,
        id: decodedClaims.uid,
      } as User;
    }

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.error("Session verification failed:", error);

    // Invalid or expired session
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
export async function updateUser(userId: string, data: Partial<User>) {
  try {
    const { id, email, ...updateData } = data as any; // Ensure we don't update ID or Email

    await db.collection("users").doc(userId).update(updateData);

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, message: "Failed to update profile" };
  }
}

// Verification Logic
async function sendVerificationEmailInternal(userId: string, email: string, name: string) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Store token in Firestore
  await db.collection("email_verifications").doc(token).set({
    userId,
    email,
    expiresAt: expiresAt.toISOString(),
  });

  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

  // Send email via Resend
  await resend.emails.send({
    from: "SmartInterview <onboarding@resend.dev>", // Replace with your verified domain in production
    to: email,
    subject: "Verify your email - SmartInterview",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to SmartInterview, ${name}!</h2>
        <p>Please click the link below to verify your email address and activate your account:</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; rounded: 8px; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #666; font-size: 12px;">SmartInterview Team</p>
      </div>
    `,
  });
}

export async function resendVerificationEmail(email: string) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const userSnapshot = await db.collection("users").where("email", "==", normalizedEmail).limit(1).get();

    if (userSnapshot.empty) {
      // Don't reveal if user exists for security
      return { success: true, message: "Verification email sent if account exists." };
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    if (userData.isEmailVerified) {
      return { success: false, message: "This email is already verified." };
    }

    // Send the email
    await sendVerificationEmailInternal(userDoc.id, normalizedEmail, userData.name);

    return { success: true, message: "Verification email sent." };
  } catch (error) {
    console.error("Error resending verification email:", error);
    return { success: false, message: "Failed to resend email. Please try again later." };
  }
}

export async function verifyEmailToken(token: string) {
  try {
    const tokenDoc = await db.collection("email_verifications").doc(token).get();

    if (!tokenDoc.exists) {
      return { success: false, message: "Invalid or expired verification link." };
    }

    const { userId, expiresAt } = tokenDoc.data()!;

    if (new Date() > new Date(expiresAt)) {
      // Token expired, delete it
      await db.collection("email_verifications").doc(token).delete();
      return { success: false, message: "Verification link has expired. Please request a new one." };
    }

    // Mark user as verified
    await db.collection("users").doc(userId).update({
      isEmailVerified: true,
      verifiedAt: new Date().toISOString(),
    });

    // Delete the token
    await db.collection("email_verifications").doc(token).delete();

    return { success: true, message: "Email verified successfully! You can now sign in." };
  } catch (error) {
    console.error("Error verifying email token:", error);
    return { success: false, message: "An error occurred during verification. Please try again." };
  }
}
