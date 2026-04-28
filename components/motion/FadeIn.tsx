"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type PropsWithChildren } from "react";
import { useReducedMotion } from "@/components/providers/MotionProvider";
import { cn } from "@/lib";

type FadeInProps = PropsWithChildren<{
  className?: string;
  delay?: number;
}>;

const FadeIn = ({ children, className, delay = 0 }: FadeInProps) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={reduced ? false : { opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
};

export { FadeIn };
