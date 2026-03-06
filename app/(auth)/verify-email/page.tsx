"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { verifyEmailToken } from "@/lib/actions/auth.action";
import { Button } from "@/components/ui/button";

interface VerifyEmailPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
    const { token } = use(searchParams);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        async function verify() {
            if (!token) {
                setStatus("error");
                setMessage("No verification token found. Please check your link.");
                return;
            }

            try {
                const result = await verifyEmailToken(token);
                if (result.success) {
                    setStatus("success");
                    setMessage(result.message);
                } else {
                    setStatus("error");
                    setMessage(result.message || "Verification failed. The link may be expired or invalid.");
                }
            } catch (error) {
                console.error("Verification error:", error);
                setStatus("error");
                setMessage("An unexpected error occurred. Please try again later.");
            }
        }

        verify();
    }, [token]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-dark-100 p-6">
            <div className="card-border lg:min-w-[500px]">
                <div className="flex flex-col gap-6 card py-14 px-10 text-center">
                    <div className="flex flex-row gap-2 justify-center mb-4">
                        <Image src="/logo.png" alt="logo" height={48} width={56} />
                        <h2 className="text-primary-100">SmartInterview</h2>
                    </div>

                    <div className="mb-4">
                        {status === "loading" && (
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        )}
                        {status === "success" && (
                            <div className="bg-green-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M20 6 9 17l-5-5" /></svg>
                            </div>
                        )}
                        {status === "error" && (
                            <div className="bg-red-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </div>
                        )}
                    </div>

                    <h3 className="text-xl font-bold">
                        {status === "loading" ? "Verifying..." : status === "success" ? "Email Verified" : "Verification Failed"}
                    </h3>

                    <p className="text-light-400">
                        {message}
                    </p>

                    <div className="mt-6">
                        {status === "success" ? (
                            <Link href="/sign-in">
                                <Button className="btn w-full">
                                    Sign In to Your Account
                                </Button>
                            </Link>
                        ) : status === "error" ? (
                            <Link href="/sign-up">
                                <Button className="btn w-full">
                                    Back to Sign Up
                                </Button>
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
