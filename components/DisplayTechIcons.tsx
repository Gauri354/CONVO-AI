"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { mappings } from "@/constants";

const techIconBaseURL = "https://cdn.jsdelivr.net/npm/devicon@2.16.0/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings] || key;
};

const DisplayTechIcons = ({ techStack }: { techStack: string[] }) => {
  const [failedIcons, setFailedIcons] = useState<Record<string, boolean>>({});

  const icons = techStack
    .map((tech) => {
      const normalized = normalizeTechName(tech);
      if (normalized === "__skip__") return null;
      const url = `${techIconBaseURL}/${normalized}/${normalized}-original.svg`;
      return { tech, url };
    })
    .filter((icon): icon is { tech: string; url: string } => icon !== null)
    .slice(0, 3);

  return (
    <div className="flex flex-row">
      {icons.map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex items-center justify-center",
            index >= 1 && "-ml-3"
          )}
        >
          <span className="tech-tooltip">{tech}</span>

          <Image
            src={failedIcons[tech] ? "/tech.svg" : url}
            alt={tech}
            width={20}
            height={20}
            className="size-5"
            unoptimized
            onError={() => {
              if (!failedIcons[tech]) {
                setFailedIcons(prev => ({ ...prev, [tech]: true }));
              }
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;
