"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const BackButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="p-2 hover:bg-dark-200 rounded-full transition-colors text-light-400 hover:text-white cursor-pointer"
      title="Go Back"
    >
      <ArrowLeft size={24} />
    </button>
  );
};

export default BackButton;
