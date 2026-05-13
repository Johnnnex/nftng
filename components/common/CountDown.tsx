"use client";

import { Fragment, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib";
import { useReducedMotion } from "@/components";

const UNITS = ["Days", "Hours", "Minutes", "Seconds"] as const;

const ZERO = { days: 0, hours: 0, minutes: 0, seconds: 0 };

function useCountdown(targetDate: Date | string) {
  const [time, setTime] = useState(ZERO);

  useEffect(() => {
    const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
    const calc = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };
    setTime(calc());
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return time;
}

const FlipDigit = ({ value, reduced }: { value: number; reduced: boolean }) => (
  <span className="relative overflow-hidden inline-block h-[1.2em] w-[0.6em]">
    {reduced ? (
      <span className="absolute inset-0 flex items-center justify-center">{value}</span>
    ) : (
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ y: "-60%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "60%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    )}
  </span>
);

type CountDownProps = {
  targetDate: Date | string;
  className?: string;
  boxClassName?: string;
  numberClassName?: string;
  labelClassName?: string;
  separatorClassName?: string;
};

const CountDown = ({
  targetDate,
  className,
  boxClassName,
  numberClassName,
  labelClassName,
  separatorClassName,
}: CountDownProps) => {
  const reduced = !!useReducedMotion();
  const time = useCountdown(targetDate);
  const values = [time.days, time.hours, time.minutes, time.seconds];

  return (
    <div className={cn("flex items-center gap-1.75", className)}>
      {UNITS.map((label, index) => (
        <Fragment key={label}>
          <div
            className={cn(
              "flex bg-[#ffffff20] rounded-[.8125rem] justify-center flex-col gap-px items-center",
              boxClassName,
            )}
          >
            <span className={cn("flex text-white font-semibold tracking-[-4%]", numberClassName)}>
              <FlipDigit value={Math.floor(values[index] / 10)} reduced={reduced} />
              <FlipDigit value={values[index] % 10} reduced={reduced} />
            </span>
            <span
              className={cn(
                "text-white tracking-[-4%] font-normal",
                labelClassName,
              )}
            >
              {label}
            </span>
          </div>
          {index !== 3 && (
            <span
              className={cn(
                "text-white font-normal tracking-[-4%]",
                separatorClassName,
              )}
            >
              :
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
};

export { CountDown };
