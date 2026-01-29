"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelInterview } from "@/lib/actions/general.action";

const CancelInterviewButton = ({ interviewId }: { interviewId: string }) => {
  const router = useRouter();

  const handleCancel = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm("Are you sure you want to cancel this interview?");
    if (!confirmed) return;

    try {
      const result = await cancelInterview(interviewId);
      if (result.success) {
        toast.success("Interview cancelled successfully");
        router.refresh();
      } else {
        toast.error("Failed to cancel interview");
      }
    } catch (error) {
      console.error("Error cancelling interview:", error);
      toast.error("An error occurred while cancelling the interview");
    }
  };

  return (
    <button
      onClick={handleCancel}
      className="absolute top-2 left-2 p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-colors z-10"
      title="Cancel Interview"
    >
      <X size={16} />
    </button>
  );
};

export default CancelInterviewButton;
