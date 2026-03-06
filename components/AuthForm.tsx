"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp, resendVerificationEmail } from "@/lib/actions/auth.action";
import FormField from "./FormField";
import { DISPOSABLE_DOMAINS, TYPO_DOMAIN_MAPPING, EMAIL_REGEX } from "@/constants";
import { useEffect, useState } from "react";

const authFormSchema = (type: FormType) => {
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
    password: type === "sign-up"
      ? z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[a-zA-Z].*[a-zA-Z].*[a-zA-Z].*[a-zA-Z].*[a-zA-Z]/, "Must contain at least 5 alphabets")
        .regex(/\d.*\d/, "Must contain at least 2 numbers")
        .regex(/[^a-zA-Z0-9]/, "Must contain at least 1 special character")
      : z.string().min(1, "Password is required"),
    gender: type === "sign-up" ? z.enum(["male", "female"], {
      errorMap: () => ({ message: "Please select your gender" })
    }) : z.string().optional(),
    careerStage: type === "sign-up" ? z.string().min(1, "Please select your career stage") : z.string().optional(),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const isSignIn = type === "sign-in";
  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      gender: "" as any,
      careerStage: "",
    },
  });

  const email = form.watch("email");
  const password = form.watch("password");
  const [typoSuggestion, setTypoSuggestion] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

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

  const passwordRequirements = [
    { label: "At least 5 alphabets", met: (password.match(/[a-zA-Z]/g) || []).length >= 5 },
    { label: "At least 2 numbers", met: (password.match(/\d/g) || []).length >= 2 },
    { label: "At least 1 special character", met: /[^a-zA-Z0-9]/.test(password) },
    { label: "Minimum 8 characters", met: password.length >= 8 },
  ];

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("Submitting form with type:", type, "Data:", { ...data, password: "***" });
    const loadingToast = toast.loading(isSignIn ? "Signing in..." : "Creating your account...");
    try {
      if (type === "sign-up") {
        const { name, email, password, gender, careerStage } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
          gender: gender as "male" | "female",
          careerStage: careerStage!,
        });

        if (!result.success) {
          toast.dismiss(loadingToast);
          toast.error(result.message);
          return;
        }

        // AUTO-LOGIN: Immediately sign in and redirect after successful signup
        const idToken = await userCredential.user.getIdToken();
        const signInResult = await signIn({
          email,
          idToken,
          password,
        });

        if (signInResult && !signInResult.success) {
          toast.dismiss(loadingToast);
          toast.error("Account created, but auto-login failed. Please sign in manually.");
          router.push("/sign-in");
          return;
        }

        toast.dismiss(loadingToast);
        toast.success("Account created successfully!");
        window.location.replace("/");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Check verification status via Server Action since client SDK might not have it instantly updated
        const idToken = await userCredential.user.getIdToken();
        const signInResult = await signIn({
          email,
          idToken,
          password,
        });

        if (signInResult && !signInResult.success) {
          toast.dismiss(loadingToast);

          if (signInResult.message?.includes("verify your email")) {
            toast.error(signInResult.message, {
              action: {
                label: "Resend Email",
                onClick: () => {
                  toast.promise(resendVerificationEmail(email), {
                    loading: "Sending...",
                    success: "Verification email sent!",
                    error: "Failed to send email. Please try again later.",
                  });
                },
              },
            });
            return;
          }

          toast.error(signInResult.message);
          return;
        }

        toast.dismiss(loadingToast);
        toast.success("Signed in successfully!");
        window.location.replace("/");
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error("Firebase Auth Error:", error);

      let errorMessage = "An error occurred. Please try again.";

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use. Please sign in instead.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "The email address is badly formatted.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  if (verificationSent) {
    return (
      <div className="card-border lg:min-w-[566px]">
        <div className="flex flex-col gap-6 card py-14 px-10 text-center">
          <div className="flex flex-row gap-2 justify-center mb-4">
            <Image src="/logo.png" alt="logo" height={48} width={56} />
            <h2 className="text-primary-100">SmartInterview</h2>
          </div>
          <div className="bg-primary-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
          </div>
          <h3 className="text-xl font-bold">Verify your email</h3>
          <p className="text-light-400">
            We've sent a verification link to <span className="text-primary-100 font-semibold">{email}</span>.
            Please check your inbox and click the link to activate your account.
          </p>
          <div className="flex flex-col gap-4 mt-6">
            <Button className="btn" onClick={() => window.location.replace("/sign-in")}>
              Go to Sign In
            </Button>
            <button
              type="button"
              onClick={() => {
                toast.promise(resendVerificationEmail(email), {
                  loading: "Resending...",
                  success: "Verification email sent!",
                  error: "Failed to resend. Please try again later.",
                });
              }}
              className="text-sm text-primary-100 hover:underline"
            >
              Didn't receive the email? Resend link
            </button>
          </div>
        </div>
      </div>
    );
  }

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

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            {!isSignIn && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${req.met ? "bg-green-500" : "bg-red-500"}`} />
                    <span className={`text-[10px] ${req.met ? "text-green-500" : "text-gray-400"}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {isSignIn && (
              <div className="flex justify-end -mt-4">
                <button
                  type="button"
                  onClick={() => toast.info("Password reset feature coming soon!")}
                  className="text-xs text-primary-100 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {!isSignIn && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="label text-sm font-medium">Gender</label>
                  <select
                    {...form.register("gender")}
                    className="input bg-dark-200 rounded-full min-h-12 px-5 text-light-100 border-none outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {form.formState.errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.gender.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label text-sm font-medium">Career Stage</label>
                  <select
                    {...form.register("careerStage")}
                    className="input bg-dark-200 rounded-full min-h-12 px-5 text-light-100 border-none outline-none"
                  >
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="graduate">Graduate</option>
                    <option value="employee">Employee</option>
                    <option value="other">Other</option>
                  </select>
                  {form.formState.errors.careerStage && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.careerStage.message}</p>
                  )}
                </div>
              </>
            )}

            <Button className="btn" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-dark-100 border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                isSignIn ? "Sign In" : "Create an Account"
              )}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
