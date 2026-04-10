"use client";

import { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/actions/auth.action";
import { Button } from "@/components/ui/button";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = use(searchParams);
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("No reset token found. Please check your link.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Resetting password...");

    try {
      const result = await resetPassword(token, newPassword);
      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(result.message);
        setSuccess(true);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Reset password error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-100 p-6">
      <div className="card-border lg:min-w-[500px]">
        <div className="flex flex-col gap-6 card py-14 px-10 text-center">
          <div className="flex flex-row gap-2 justify-center mb-4">
            <Image src="/logo.png" alt="logo" height={48} width={56} />
            <h2 className="text-primary-100">SmartInterview</h2>
          </div>

          {!success ? (
            <>
              <h3 className="text-xl font-bold">Reset Your Password</h3>
              <p className="text-light-400">Enter your new password below.</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 w-full">
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-sm font-medium">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="input bg-dark-200 rounded-full min-h-12 px-5 text-light-100 border-none outline-none"
                    required
                  />
                </div>

                <Button className="btn mt-4" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="bg-green-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M20 6 9 17l-5-5" /></svg>
              </div>
              <h3 className="text-xl font-bold">Password Reset Successful</h3>
              <p className="text-light-400">You can now sign in using your new password.</p>
              <div className="mt-6">
                <Link href="/sign-in">
                  <Button className="btn w-full">Go to Sign In</Button>
                </Link>
              </div>
            </>
          )}

          {!success && !token && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
              Invalid or missing reset token. Ensure you clicked the full link in your email.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
