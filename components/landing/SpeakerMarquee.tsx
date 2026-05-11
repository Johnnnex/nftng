"use client";

import { type CSSProperties } from "react";
import { TeamCard, useReducedMotion } from "@/components";
import { SPEAKERS_A, SPEAKERS_B, TeamMember } from "@/data";

const SPEAKER_DATA_A = [...SPEAKERS_A, ...SPEAKERS_A];
const SPEAKER_DATA_B = [...SPEAKERS_B, ...SPEAKERS_B];
const SPEAKERS = [...SPEAKERS_A, ...SPEAKERS_B];

const MarqueeRow = ({
  reverse,
  data,
  duration = 30,
}: {
  data: TeamMember[];
  reverse?: boolean;
  duration?: number;
}) => (
  <div
    data-animated="true"
    className="marquee-anim overflow-hidden"
    style={
      {
        "--marquee-gap": "0px",
        mask: "none",
        WebkitMask: "none",
      } as CSSProperties
    }
  >
    <div
      className="inner flex w-max"
      style={{
        animationDuration: `${duration}s`,
        ...(reverse ? { animationDirection: "reverse" } : {}),
      }}
    >
      {data.map((member, i) => (
        <div key={i} className="mr-2 md:mr-3.75 shrink-0 w-60 md:w-72">
          <TeamCard {...member} />
        </div>
      ))}
    </div>
  </div>
);

const SpeakerMarquee = () => {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className="flex flex-wrap gap-4 justify-center px-4">
        {SPEAKERS.map((m, i) => (
          <div key={i} className="w-60">
            <TeamCard {...m} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4.5 md:gap-22">
      <MarqueeRow data={SPEAKER_DATA_A} duration={30} />
      <MarqueeRow data={SPEAKER_DATA_B} reverse duration={26} />
    </div>
  );
};

export { SpeakerMarquee };
