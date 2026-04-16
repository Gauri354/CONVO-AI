"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import { EMAIL_REGEX } from "@/constants";
import { sendEmail } from "@/lib/nodemailer";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

const Templates = {
  otp: (otp: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #4f46e5;">SmartInterview - Your OTP Code</h2>
      <p>Please use the following 4-digit code to complete your authentication:</p>
      <div style="margin: 30px 0; text-align: center;">
        <span style="background-color: #f3f4f6; color: #111; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 24px; letter-spacing: 4px; display: inline-block;">
          ${otp}
        </span>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p style="color: #666; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `
};

export async function sendOtp(params: { email: string; name?: string; type: "sign-in" | "sign-up" }) {
  try {
    const { email, type } = params;
    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return { success: false, message: "Invalid email address format." };
    }

    const userSnapshot = await db.collection("users").where("email", "==", normalizedEmail).get();
    const userExists = !userSnapshot.empty;

    if (type === "sign-up" && userExists) {
      return { success: false, message: "User already exists. Please sign in." };
    }
    if (type === "sign-in" && !userExists) {
      return { success: false, message: "Account not found. Please sign up." };
    }

    // Generate 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.collection("otps").doc(normalizedEmail).set({
      otp,
      expiresAt: expiresAt.toISOString(),
    });

    // Send the email using the generic sendEmail utility
    // We update .env.local to set SMTP_FROM_EMAIL to mbeproject04@gmail.com
    await sendEmail({
      to: normalizedEmail,
      subject: "Your SmartInterview Login Code",
      html: Templates.otp(otp)
    });

    return { success: true, message: "OTP sent to your email!" };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, message: "Failed to send OTP. Please try again." };
  }
}

export async function verifyOtpAndLogin(params: { email: string; otp: string; name?: string; type: "sign-in" | "sign-up" }) {
  try {
    const { email, otp, name, type } = params;
    const normalizedEmail = email.trim().toLowerCase();

    const otpDoc = await db.collection("otps").doc(normalizedEmail).get();
    
    if (!otpDoc.exists) {
      return { success: false, message: "No OTP request found for this email." };
    }

    const otpData = otpDoc.data()!;
    if (otpData.otp !== otp) {
      return { success: false, message: "Invalid OTP code." };
    }

    if (new Date() > new Date(otpData.expiresAt)) {
      await db.collection("otps").doc(normalizedEmail).delete();
      return { success: false, message: "OTP has expired. Please request a new one." };
    }

    // OTP is valid. Delete it.
    await db.collection("otps").doc(normalizedEmail).delete();

    let uid: string;

    if (type === "sign-up") {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: normalizedEmail,
        displayName: name,
        emailVerified: true
      });
      uid = userRecord.uid;

      // Save user to Firestore Custom DB
      await db.collection("users").doc(uid).set({
        name: name || "New User",
        email: normalizedEmail,
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        subscriptionPlan: "FREE",
        subscriptionStatus: "ACTIVE",
        interviewCountToday: 0,
        lastInterviewDate: new Date().toISOString().split("T")[0],
      });
    } else {
      // Sign in check
      const userSnapshot = await db.collection("users").where("email", "==", normalizedEmail).get();
      if (userSnapshot.empty) {
        return { success: false, message: "User document missing in DB." };
      }
      uid = userSnapshot.docs[0].id;
    }

    // Mint a custom token so the client can signInWithCustomToken and obtain a standard Firebase Session
    const customToken = await auth.createCustomToken(uid);

    return { success: true, customToken };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, message: "An error occurred during verification. Please try again." };
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, false);
    
    // Fetch from db
    const userRecord = await db.collection("users").doc(decodedClaims.uid).get();

    if (!userRecord.exists) {
      const basicUser = {
        name: decodedClaims.name || decodedClaims.email?.split('@')[0] || "New User",
        email: decodedClaims.email || "",
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        subscriptionPlan: "FREE",
        subscriptionStatus: "ACTIVE",
        interviewCountToday: 0,
        lastInterviewDate: new Date().toISOString().split("T")[0],
      };
      await db.collection("users").doc(decodedClaims.uid).set(basicUser);
      return JSON.parse(JSON.stringify({ id: decodedClaims.uid, ...basicUser }));
    }

    const userData = userRecord.data()!;
    return JSON.parse(JSON.stringify({ id: userRecord.id, ...userData }));
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function updateUser(userId: string, data: any) {
  try {
    const { id, email, ...updateData } = data; // Prevent updating IDs or emails directly
    await db.collection("users").doc(userId).update(updateData);
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, message: "Failed to update profile" };
  }
}
export async function loginWithMagicToken(token: string, interviewId: string) {
  try {
    const interviewDoc = await db.collection("interviews").doc(interviewId).get();
    if (!interviewDoc.exists) return { success: false, message: "Invalid interview" };

    const interviewData = interviewDoc.data()!;
    if (interviewData.magicToken !== token) {
      return { success: false, message: "Invalid or expired token" };
    }

    // Token matches! Get user and log in
    const userId = interviewData.userId;
    const user = await auth.getUser(userId);

    // Create session cookie
    // Note: We need a custom token to create a session cookie if we don't have an ID token
    // But since we are backend, we can create a custom token then use it? 
    // Actually, Firebase Admin can create a session cookie from an ID token only.
    // Instead of session cookie, we can use a custom simpler approach or create a custom token for the frontend to use.
    
    // For simplicity in this mock app, let's just create a custom token and return it
    const customToken = await auth.createCustomToken(userId);
    
    // We also want to invalidate the token after use
    await db.collection("interviews").doc(interviewId).update({ magicToken: null });

    return { success: true, customToken };
  } catch (error) {
    console.error("Magic login failed:", error);
    return { success: false };
  }
}
