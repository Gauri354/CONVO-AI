import { ReactNode } from "react";
import { redirect } from "next/navigation";
import BackButton from "@/components/BackButton";
import { isAuthenticated } from "@/lib/actions/auth.action";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (isUserAuthenticated) redirect("/");

  return (
    <div className="auth-layout relative">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-50">
        <BackButton />
      </div>
      {children}
    </div>
  );
};

export default AuthLayout;
