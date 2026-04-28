"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useReducedMotion } from "@/components/providers/MotionProvider";
import { cn } from "@/lib";

type WordByWordProps = {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p";
};

const WordByWord = ({
  text,
  className,
  delay = 0,
  as: Tag = "h2",
}: WordByWordProps) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const words = text.split(" ");

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag ref={ref} className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="mr-[0.28em] last:mr-0"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: delay + i * 0.06,
          }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
};

export { WordByWord };
