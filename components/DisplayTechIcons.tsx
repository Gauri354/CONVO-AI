"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { mappings } from "@/constants";

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const DisplayTechIcons = ({ techStack }: { techStack: string[] }) => {
  const [failedIcons, setFailedIcons] = useState<Record<string, boolean>>({});

  const icons = techStack.slice(0, 3).map((tech) => {
    const normalized = normalizeTechName(tech);
    const url = normalized
      ? `${techIconBaseURL}/${normalized}/${normalized}-original.svg`
      : "/tech.svg";
    return { tech, url };
  });

  return (
    <div className="flex flex-row">
      {icons.map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex flex-center",
            index >= 1 && "-ml-3"
          )}
        >
          <span className="tech-tooltip">{tech}</span>

          <Image
            src={failedIcons[tech] ? "/tech.svg" : url}
            alt={tech}
            width={100}
            height={100}
            className="size-5"
            onError={() => setFailedIcons(prev => ({ ...prev, [tech]: true }))}
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;
