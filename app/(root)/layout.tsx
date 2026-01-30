import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

import UserDropdown from "@/components/UserDropdown";
import BackButton from "@/components/BackButton";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  // if (!user) redirect("/sign-in");
  return (
    <div className="root-layout">
      <nav className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-6">
          <BackButton />

          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="SmartInterview Logo" width={56} height={48} />
            <h2 className="text-primary-100">SmartInterview</h2>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <UserDropdown user={user} />
          ) : (
            <Button asChild className="btn-secondary">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
};

export default Layout;
