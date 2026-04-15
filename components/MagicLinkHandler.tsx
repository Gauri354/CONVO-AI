"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { signInWithCustomToken } from "firebase/auth";
import { loginWithMagicToken, setSessionCookie } from "@/lib/actions/auth.action";

export default function MagicLinkHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    const interviewId = searchParams.get("interviewId");

    if (token && interviewId) {
      handleMagicLogin(token, interviewId);
    }
  }, [searchParams]);

  const handleMagicLogin = async (token: string, interviewId: string) => {
    const loadingToast = toast.loading("Auto-signing you in...");

    try {
      const result = await loginWithMagicToken(token, interviewId);

      if (!result.success || !result.customToken) {
        toast.dismiss(loadingToast);
        // If it fails, we don't do anything, the user just sees the home page (logged out or logged in as someone else)
        return;
      }

      // 1. Sign in with Firebase Custom Token
      const userCredential = await signInWithCustomToken(auth, result.customToken);
      const idToken = await userCredential.user.getIdToken();

      // 2. Set session cookie
      await setSessionCookie(idToken);

      toast.dismiss(loadingToast);
      toast.success("Signed in automatically!");

      // 3. Clear the URL params and refresh
      router.replace("/");
    } catch (error) {
      console.error("Magic login handler error:", error);
      toast.dismiss(loadingToast);
    }
  };

  return null;
}
