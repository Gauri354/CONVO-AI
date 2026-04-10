"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithCustomToken } from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { sendOtp, verifyOtpAndLogin, setSessionCookie } from "@/lib/actions/auth.action";
import FormField from "./FormField";
import { DISPOSABLE_DOMAINS, TYPO_DOMAIN_MAPPING, EMAIL_REGEX } from "@/constants";
import { useEffect, useState } from "react";

const authFormSchema = (type: "sign-in" | "sign-up") => {
  return z.object({
    name: type === "sign-up"
      ? z.string()
        .min(3, "Name must be at least 3 characters")
        .regex(/^[a-zA-Z\s]+$/, "Name can only contain characters and spaces")
      : z.string().optional(),
    email: z.string()
      .transform((val) => val.trim())
      .refine((val) => EMAIL_REGEX.test(val), { message: "Invalid email address format" })
      .refine((email) => {
        const domain = email.split("@")[1]?.toLowerCase();
        if (!domain) return false;
        return !DISPOSABLE_DOMAINS.includes(domain);
      }, "This email domain is not allowed"),
    otp: z.string().optional()
  });
};

const AuthForm = ({ type }: { type: "sign-in" | "sign-up" }) => {
  const router = useRouter();
  const isSignIn = type === "sign-in";
  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      otp: "",
    },
  });

  const email = form.watch("email");
  const [typoSuggestion, setTypoSuggestion] = useState<string | null>(null);
  
  // OTP Flow States
  const [otpSent, setOtpSent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!email || isSignIn) {
      setTypoSuggestion(null);
      return;
    }

    const [local, domain] = email.split("@");
    if (domain && TYPO_DOMAIN_MAPPING[domain.toLowerCase()]) {
      setTypoSuggestion(`${local}@${TYPO_DOMAIN_MAPPING[domain.toLowerCase()]}`);
    } else {
      setTypoSuggestion(null);
    }
  }, [email, isSignIn]);

  const handleSendOtp = async (data: z.infer<typeof formSchema>) => {
    setIsProcessing(true);
    const loadingToast = toast.loading("Sending 4-digit code...");

    try {
      const result = await sendOtp({
        email: data.email,
        name: data.name,
        type
      });

      toast.dismiss(loadingToast);

      if (!result.success) {
        toast.error(result.message);
        setIsProcessing(false);
        return;
      }

      toast.success(result.message);
      setOtpSent(true);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async (data: z.infer<typeof formSchema>) => {
    if (!data.otp || data.otp.length !== 4) {
      toast.error("Please enter a valid 4-digit code.");
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading("Verifying your code...");

    try {
      const result = await verifyOtpAndLogin({
        email: data.email,
        otp: data.otp,
        name: data.name,
        type
      });

      toast.dismiss(loadingToast);

      if (!result.success) {
        toast.error(result.message);
        setIsProcessing(false);
        return;
      }

      // We have the Firebase Custom Token. Use it to sign in on the client!
      const userCredential = await signInWithCustomToken(auth, result.customToken);
      const idToken = await userCredential.user.getIdToken();
      
      // Set the session cookie via server action securely
      await setSessionCookie(idToken);

      toast.success("Authentication successful!");
      window.location.replace("/");
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error("Auth Error:", error);
      toast.error("Authentication failed. Please check your network and try again.");
      setIsProcessing(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!otpSent) {
      await handleSendOtp(data);
    } else {
      await handleVerifyOtp(data);
    }
  };

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.png" alt="logo" height={48} width={56} />
          <h2 className="text-primary-100">SmartInterview</h2>
        </div>

        <h3>Practice job interviews with AI</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {/* Step 1: Email and Name */}
            {!otpSent && (
              <>
                {!isSignIn && (
                  <FormField
                    control={form.control}
                    name="name"
                    label="Name"
                    placeholder="Your Name"
                    type="text"
                  />
                )}

                <FormField
                  control={form.control}
                  name="email"
                  label="Email"
                  placeholder="Your email address"
                  type="email"
                />

                {typoSuggestion && (
                  <div className="bg-primary-500/10 border border-primary-500/20 p-2 rounded-lg -mt-4 mb-4">
                    <p className="text-xs text-light-400">
                      Did you mean{" "}
                      <button
                        type="button"
                        onClick={() => form.setValue("email", typoSuggestion)}
                        className="text-primary-400 font-semibold hover:underline"
                      >
                        {typoSuggestion}
                      </button>
                      ?
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Step 2: 4-digit OTP */}
            {otpSent && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-light-100">
                  Enter 4-digit code sent to your email
                </label>
                <div className="flex gap-2 justify-center my-4">
                  <input
                    type="text"
                    {...form.register("otp")}
                    placeholder="1234"
                    maxLength={4}
                    className="input bg-dark-200 rounded-full min-h-12 px-5 text-light-100 border focus:border-primary-500 outline-none w-full text-center tracking-[1em] text-2xl font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-xs text-primary-100 hover:underline flex self-start"
                >
                  &larr; Change Email
                </button>
              </div>
            )}

            <Button className="btn" type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-dark-100 border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                otpSent ? "Verify Code" : (isSignIn ? "Send Code" : "Send Code")
              )}
            </Button>
          </form>
        </Form>

        {!otpSent && (
          <p className="text-center">
            {isSignIn ? "No account yet?" : "Have an account already?"}
            <Link
              href={!isSignIn ? "/sign-in" : "/sign-up"}
              className="font-bold text-user-primary ml-1"
            >
              {!isSignIn ? "Sign In" : "Sign Up"}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
