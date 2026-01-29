"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/actions/auth.action";
import { LogOut, FileText, User } from "lucide-react";

interface UserDropdownProps {
  user: {
    name: string;
    gender: "male" | "female";
  };
}

const UserDropdown = ({ user }: UserDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/sign-up");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <p className="text-sm text-light-400 max-sm:hidden font-medium">{user.name}</p>
        <div className="relative">
          <Image
            src={user.gender === "female" ? "/female-avatar.png" : "/user-avatar.png"}
            alt="profile"
            width={40}
            height={40}
            className="rounded-full border-2 border-primary-200/30"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-success-100 border-2 border-dark-100 rounded-full"></div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-dark-200 border border-light-800 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
          <div className="px-4 py-3 border-b border-light-800 mb-2">
            <p className="text-xs text-light-400 uppercase tracking-wider font-bold">Account</p>
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 text-sm text-light-100 hover:bg-primary-200/10 hover:text-primary-200 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <User size={18} />
            <span>My Profile</span>
          </Link>

          <Link
            href="/reports"
            className="flex items-center gap-3 px-4 py-3 text-sm text-light-100 hover:bg-primary-200/10 hover:text-primary-200 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <FileText size={18} />
            <span>My Reports</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-destructive-100 hover:bg-destructive-100/10 transition-colors text-left"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
