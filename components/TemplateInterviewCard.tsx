"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";
import { cn } from "@/lib/utils";
import { Clock, BarChart, LayoutTemplate, Server, Layers, Smartphone, Cloud, Database, Shield, BrainCircuit, Users, Network, Code } from "lucide-react";

interface TemplateInterviewCardProps {
  id: string;
  userId: string;
  role: string;
  focus: string;
  level: string;
  duration: string;
  techstack: string[];
  type: string;
}

const TemplateInterviewCard = ({
  id,
  userId,
  role,
  focus,
  level,
  duration,
  techstack,
  type,
}: TemplateInterviewCardProps) => {
  const router = useRouter();

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[type] || "bg-light-600";

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96 relative hover:scale-[1.02] hover:shadow-primary-500/20 hover:shadow-2xl transition-all duration-300">
      <div className="card-interview">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
              badgeColor
            )}
          >
            <p className="badge-text ">{type}</p>
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
          <h3 className="mt-5 capitalize">{role}</h3>

          {/* Focus */}
          <p className="text-sm text-primary-200 mt-1 font-medium">{focus}</p>

          {/* Level & Duration */}
          <div className="flex flex-row gap-5 mt-4">
            <div className="flex flex-row gap-2 items-center">
              <BarChart size={18} className="text-light-400" />
              <p className="text-sm">{level}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Clock size={18} className="text-light-400" />
              <p className="text-sm">{duration}</p>
            </div>
          </div>

          {/* Description Placeholder */}
          <p className="line-clamp-2 mt-5 text-light-400 text-sm">
            Practice this {role.toLowerCase()} interview to sharpen your skills in {focus.toLowerCase()}.
          </p>
        </div>

        <div className="flex flex-row justify-between items-end mt-auto">
          <DisplayTechIcons techStack={techstack} />

          <Button asChild className="btn-primary">
            <Link
              href={`/interview?role=${encodeURIComponent(role)}&level=${encodeURIComponent(level)}&techstack=${encodeURIComponent(techstack.join(", "))}&type=${encodeURIComponent(type)}&focus=${encodeURIComponent(focus)}&shortcut=true`}
            >
              Start Interview
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateInterviewCard;
