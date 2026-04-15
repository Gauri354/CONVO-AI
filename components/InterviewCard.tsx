import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { LayoutTemplate, Server, Layers, Smartphone, Cloud, Database, Shield, BrainCircuit, Users, Network, Code, BarChart, Clock } from "lucide-react";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import CancelInterviewButton from "./CancelInterviewButton";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
  status,
  currentQuestionIndex,
  level,
  focus,
  duration,
  scheduledAt,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
        interviewId,
        userId,
      })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  const formattedDate = status === "scheduled" && scheduledAt
    ? dayjs(scheduledAt).format("MMM D, YYYY • h:mm A")
    : dayjs(feedback?.createdAt || createdAt || Date.now()).format("MMM D, YYYY");

  const isCancelled = status === "cancelled";

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96 relative hover:scale-[1.02] hover:shadow-primary-500/20 hover:shadow-2xl transition-all duration-300">
      {!feedback && !isCancelled && interviewId && (
        <CancelInterviewButton interviewId={interviewId} />
      )}
      <div className="card-interview">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
              badgeColor
            )}
          >
            <p className="badge-text ">{normalizedType}</p>
          </div>

          {/* Icon based on Role */}
          <div className="rounded-full size-[90px] flex items-center justify-center bg-light-800">
            {(() => {
              const r = role.toLowerCase();
              if (r.includes("frontend") || r.includes("ui")) return <LayoutTemplate size={40} className="text-primary-500" />;
              if (r.includes("backend") || r.includes("api")) return <Server size={40} className="text-primary-500" />;
              if (r.includes("fullstack")) return <Layers size={40} className="text-primary-500" />;
              if (r.includes("mobile") || r.includes("ios") || r.includes("android")) return <Smartphone size={40} className="text-primary-500" />;
              if (r.includes("devops") || r.includes("cloud") || r.includes("sre")) return <Cloud size={40} className="text-primary-500" />;
              if (r.includes("data") || r.includes("analyst")) return <Database size={40} className="text-primary-500" />;
              if (r.includes("security") || r.includes("cyber")) return <Shield size={40} className="text-primary-500" />;
              if (r.includes("machine") || r.includes("ai") || r.includes("model")) return <BrainCircuit size={40} className="text-primary-500" />;
              if (r.includes("manager") || r.includes("lead") || r.includes("hr")) return <Users size={40} className="text-primary-500" />;
              if (r.includes("system") || r.includes("arch")) return <Network size={40} className="text-primary-500" />;
              return <Code size={40} className="text-primary-500" />;
            })()}
          </div>

          {/* Interview Role */}
          <h3 className="mt-5 capitalize">{role} Interview</h3>

          {/* Focus */}
          <p className="text-sm text-primary-200 mt-1 font-medium">{focus || formattedDate}</p>

          {/* Info Row (Level & Duration/Score) */}
          <div className="flex flex-row gap-5 mt-4">
            <div className="flex flex-row gap-2 items-center">
              <BarChart size={18} className="text-light-400" />
              <p className="text-sm">{level || "Intermediate"}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Clock size={18} className="text-light-400" />
              <p className="text-sm">
                {status === "in-progress"
                  ? `Q ${(currentQuestionIndex || 0) + 1} / 5`
                  : duration || "30 mins"}
              </p>
            </div>
            
            {feedback && (
                <div className="flex flex-row gap-2 items-center">
                    <Image src="/star.svg" width={18} height={18} alt="star" />
                    <p className="text-sm font-bold text-primary-500">{feedback.totalScore}/100</p>
                </div>
            )}
          </div>

          {/* Feedback or Placeholder Text */}
          <p className="line-clamp-2 mt-5 text-light-400 text-sm">
            {isCancelled
              ? "This interview has been cancelled."
              : feedback?.finalAssessment ||
              "You haven't taken this interview yet. Take it now to improve your skills."}
          </p>
        </div>

        <div className="flex flex-row justify-between items-end mt-auto">
          <DisplayTechIcons techStack={techstack} />

          <div className="flex flex-col gap-2">
            <Button className={cn("btn-primary", isCancelled && "bg-light-800 pointer-events-none opacity-50")} disabled={isCancelled}>
              {isCancelled ? (
                "Cancelled"
              ) : (
                <Link
                  href={
                    feedback
                      ? `/interview/${interviewId}/feedback`
                      : `/interview/${interviewId}`
                  }
                >
                  {feedback ? "View Report" : "Take Interview"}
                </Link>
              )}
            </Button>

            {feedback && (
              <Button variant="ghost" className="text-xs py-1 h-8 text-primary-400 hover:text-primary-200" asChild>
                <Link href={`/interview/${interviewId}`}>
                  Retake Interview
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
