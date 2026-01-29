"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

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

export async function signUp(params: SignUpParams) {
  const { uid, name, email, gender, careerStage } = params;

  try {
    // check if user exists in db
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

    // save user to db
    await db.collection("users").doc(uid).set({
      name,
      email,
      gender,
      careerStage,
      // profileURL,
      // resumeURL,
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
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
  const { idToken } = params;
  console.log("signIn action called");

  try {
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
        gender: "male",
        careerStage: "other",
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
