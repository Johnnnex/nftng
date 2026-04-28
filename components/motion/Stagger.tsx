"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef, type PropsWithChildren, type CSSProperties } from "react";
import { useReducedMotion } from "@/components/providers/MotionProvider";
import { cn } from "@/lib";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const itemFadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

type StaggerContainerProps = PropsWithChildren<{
  className?: string;
  delay?: number;
}>;

const StaggerContainer = ({
  children,
  className,
  delay = 0,
}: StaggerContainerProps) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });

  if (reduced) return <div className={cn(className)}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ delayChildren: delay }}
    >
      {children}
    </motion.div>
  );
};

const StaggerItem = ({
  children,
  className,
  fade = false,
  style,
}: PropsWithChildren<{
  className?: string;
  fade?: boolean;
  style?: CSSProperties;
}>) => {
  const reduced = useReducedMotion();
  if (reduced)
    return (
      <div className={cn(className)} style={style}>
        {children}
      </div>
    );

  return (
    <motion.div
      className={cn(className)}
      style={style}
      variants={fade ? itemFadeVariants : itemVariants}
    >
      {children}
    </motion.div>
  );
};

export { StaggerContainer, StaggerItem };
