"use client";

import { SVGClient } from "./SVGClient";
import { cn } from "@/lib";
import type { TeamMember } from "@/data";

const TeamCard = ({
  name,
  title,
  image,
  linkedinUrl,
  className,
}: TeamMember & { className?: string }) => (
  <div
    className={cn(
      "aspect-[.73] relative rounded-2xl bg-center overflow-hidden bg-cover bg-no-repeat",
      className,
    )}
    style={{ backgroundImage: `url(/images/${image})` }}
  >
    <div className="absolute p-[1.0625rem_0.9375rem] inset-0 w-full h-full bg-linear-to-b from-black/0 to-black flex items-end">
      <div className="flex justify-between items-end w-full">
        <div className="flex flex-col gap-2">
          <span className="text-white text-[1rem] font-normal">{name}</span>
          <span className="text-[#FFFFFFB2] font-normal text-[.8125rem]">
            {title}
          </span>
        </div>
        <a href={linkedinUrl || undefined} target="_blank" rel="noreferrer">
          <SVGClient src="/svg/devicon_linkedin.svg" />
        </a>
      </div>
    </div>
  </div>
);

export { TeamCard };
