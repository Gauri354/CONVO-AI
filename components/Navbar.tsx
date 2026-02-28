"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import UserDropdown from "@/components/UserDropdown";
import { Button } from "@/components/ui/button";

interface NavbarProps {
    user: any; // Using any for now to avoid extensive type imports conflicts, typically User type
}

const Navbar = ({ user }: NavbarProps) => {
    const pathname = usePathname();

    const navLinks = [
        {
            label: "Home",
            route: "/",
        },
        {
            label: "Interviews",
            route: "/interview",
        },
        {
            label: "Reports",
            route: "/reports", // Assuming this route exists or will exist based on file structure
        }
    ];

    return (
        <nav className="flex justify-between items-center w-full py-4 px-6 md:px-10 sticky top-0 z-50 bg-dark-100/70 backdrop-blur-md border-b border-light-800/10 transition-all duration-300">
            <div className="flex items-center gap-10">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="SmartInterview Logo"
                        width={48} // Adjusted size for better fit
                        height={48}
                        className="object-contain"
                    />
                    <h2 className="text-2xl font-bold text-primary-100 hidden sm:block">SmartInterview</h2>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.route || (pathname.startsWith(link.route) && link.route !== "/");

                        return (
                            <Link
                                key={link.route}
                                href={link.route}
                                className={cn(
                                    "text-base font-medium transition-colors duration-200",
                                    isActive
                                        ? "text-primary-200"
                                        : "text-light-400 hover:text-primary-100"
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
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
    );
};

export default Navbar;
