"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { cn } from "@/lib";
import { SVGClient, useReducedMotion } from "@/components";
import { monumentExtended } from "../layout";

const CollectionsComingSoon = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Fade in at entry, hold, fade out at exit
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.14, 0.8, 1],
    [0, 1, 1, 0],
  );
  // Grow in slightly, hold, drift out larger
  const scale = useTransform(
    scrollYProgress,
    [0, 0.14, 0.8, 1],
    [0.88, 1, 1, 1.06],
  );
  // Drift upward through the section (parallax)
  const y = useTransform(scrollYProgress, [0, 1], [36, -36]);
  // Blur in focus: blurry at entry/exit, sharp through the middle
  const blurPx = useTransform(scrollYProgress, [0, 0.14, 0.8, 1], [7, 0, 0, 7]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  const motionStyle = reduced ? {} : { opacity, scale, y, filter };

  return (
    <section ref={ref} className="relative overflow-clip">
      {/* Mobile: sticky centered label */}
      <motion.div
        style={motionStyle}
        className="flex lg:hidden gap-2.25 justify-center left-0 w-full sticky top-[50vh] -translate-y-1/2 z-4 items-center"
      >
        <SVGClient src="/svg/info.svg" />
        <span className="text-black text-[1rem] sm:text-[1.125rem] md:text-[1.25rem] font-normal">
          Products will be live soon. Stay tuned!
        </span>
      </motion.div>

      {children}

      {/* Overlay */}
      <div className="absolute flex items-center inset-0 z-3">
        <motion.span
          style={motionStyle}
          className={cn(
            "bg-[#6EC93E] relative lg:block font-normal hidden z-1 w-full text-[2.25rem] py-[1.8125rem_1.4375rem] text-white leading-16.25 text-center",
            monumentExtended.className,
          )}
        >
          PRODUCTS WILL BE LIVE SOON. STAY TUNED!
        </motion.span>
        <span className="lg:w-[80%] inset-0 absolute mx-auto h-full bg-[#ffffff90] bg-[url(/images/collections-page-mask-sm-bg.png)] md:bg-[url(/images/collections-page-mask-bg.png)] bg-center bg-cover block" />
      </div>
    </section>
  );
};

export { CollectionsComingSoon };
