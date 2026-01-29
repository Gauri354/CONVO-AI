import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import UserDropdown from "@/components/UserDropdown";
import BackButton from "@/components/BackButton";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-6">
          <BackButton />

          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="MockMate Logo" width={38} height={32} />
            <h2 className="text-primary-100">PrepWise</h2>
          </Link>
        </div>

        <UserDropdown user={user} />
      </nav>

      <main>{children}</main>
    </div>
  );
};

export default Layout;
