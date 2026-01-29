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
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3, "Name must be at least 3 characters") : z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: type === "sign-up" 
      ? z.string().min(6, "Password must be at least 6 characters") 
      : z.string().min(1, "Password is required"),
    gender: type === "sign-up" ? z.enum(["male", "female"], {
      errorMap: () => ({ message: "Please select your gender" })
    }) : z.string().optional(),
    careerStage: type === "sign-up" ? z.string().min(2, "Please select your career stage") : z.string().optional(),
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
      gender: "male" as "male" | "female",
      careerStage: "",
    },
  });

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

        // Auto sign-in after sign-up
        const idToken = await userCredential.user.getIdToken();
        if (idToken) {
          const signInResult = await signIn({
            email,
            idToken,
          });

          if (signInResult && !signInResult.success) {
            toast.dismiss(loadingToast);
            toast.error(signInResult.message);
            return;
          }
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

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.dismiss(loadingToast);
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        const signInResult = await signIn({
          email,
          idToken,
        });

        if (signInResult && !signInResult.success) {
          toast.dismiss(loadingToast);
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
      console.error("Error Code:", error.code);
      console.error("Error Message:", error.message);
      
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

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">PrepWise</h2>
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

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

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
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
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
