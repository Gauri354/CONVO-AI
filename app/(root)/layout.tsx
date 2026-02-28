import { ReactNode } from "react";
// import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  // if (!user) redirect("/sign-in");
  return (
    <div className="root-layout min-h-screen flex flex-col justify-between">
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
