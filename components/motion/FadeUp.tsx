"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type PropsWithChildren } from "react";
import { useReducedMotion } from "@/components/providers/MotionProvider";
import { cn } from "@/lib";

type FadeUpProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  once?: boolean;
}>;

const FadeUp = ({
  children,
  className,
  delay = 0,
  once = true,
}: FadeUpProps) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once, margin: "-8% 0px" });

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94], delay }}
    >
      {children}
    </motion.div>
  );
};

export { FadeUp };
