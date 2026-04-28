"use client";

import { useEffect, useState } from "react";
import { useTextScramble } from "@/hooks/useTextScramble";
import { cn } from "@/lib";

// On-mount scramble — fires once when component enters the page
const ScrambleText = ({
  text,
  className,
  delay = 300,
}: {
  text: string;
  className?: string;
  delay?: number;
}) => {
  const [triggered, setTriggered] = useState(false);
  const output = useTextScramble(text, triggered);

  useEffect(() => {
    const t = setTimeout(() => setTriggered(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return <span className={cn(className)}>{output}</span>;
};

// Hover scramble — retriggers on each mouseenter
const HoverScramble = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const [hovered, setHovered] = useState(false);
  const output = useTextScramble(text, hovered);

  return (
    <span
      className={cn(className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {output}
    </span>
  );
};

export { ScrambleText, HoverScramble };
