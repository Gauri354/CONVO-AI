"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { resendVerificationEmail } from "@/lib/actions/auth.action";

interface VerificationBannerProps {
    user: {
        email: string;
        isEmailVerified: boolean;
    };
}

const VerificationBanner = ({ user }: VerificationBannerProps) => {
    const [show, setShow] = useState(!user.isEmailVerified);
    const [sending, setSending] = useState(false);

    if (!show) return null;

    const handleResend = async () => {
        setSending(true);
        try {
            const result = await resendVerificationEmail(user.email);
            if (result.success) {
                toast.success("Verification email sent!");
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to resend email. Please try again later.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-primary-500/10 border-b border-primary-500/20 py-3 px-4 sticky top-0 z-50 animate-in fade-in slide-in-from-top duration-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-sm">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                    </div>
                    <p className="text-light-200">
                        Please verify your email <span className="text-primary-100 font-semibold">{user.email}</span> to unlock all features.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleResend}
                        disabled={sending}
                        className="text-xs font-bold text-primary-100 hover:text-primary-400 transition-colors uppercase tracking-wider disabled:opacity-50"
                    >
                        {sending ? "Sending..." : "Resend Link"}
                    </button>
                    <button
                        onClick={() => setShow(false)}
                        className="text-light-400 hover:text-light-100 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationBanner;
