"use client";

import { Fragment } from "react";
import { cn } from "@/lib";
import { useReducedMotion } from "@/components";

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER — delete this block when the event date is set
// ─────────────────────────────────────────────────────────────────────────────
const GlowPulse = ({ className }: { className?: string }) => {
  const reduced = useReducedMotion();
  return (
    <span
      className={cn(className, !reduced && "animate-pulse")}
      style={
        !reduced
          ? { textShadow: "0 0 10px rgba(110, 201, 62, 0.45)" }
          : undefined
      }
    >
      --
    </span>
  );
};
// ─────────────────────────────────────────────────────────────────────────────
// END PLACEHOLDER
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// REAL COUNTDOWN — when event date is confirmed, do this:
//
//  1. Uncomment the import line below
//  2. Uncomment useCountdown + FlipDigit
//  3. Uncomment `const time = useCountdown(targetDate!)` inside CountDown
//  4. Uncomment `targetDate?: Date` in CountDownProps
//  5. In the JSX, uncomment <FlipDigit /> and delete <GlowPulse />
//  6. In Events.tsx add targetDate={new Date("YYYY-MM-DD")} to both <CountDown />
//  7. Delete the PLACEHOLDER block above
// ─────────────────────────────────────────────────────────────────────────────
// import { AnimatePresence, motion } from "framer-motion";
//
// function useCountdown(targetDate: Date) {
//   const calc = () => {
//     const diff = Math.max(0, targetDate.getTime() - Date.now());
//     return {
//       days:    Math.floor(diff / 86400000),
//       hours:   Math.floor((diff % 86400000) / 3600000),
//       minutes: Math.floor((diff % 3600000) / 60000),
//       seconds: Math.floor((diff % 60000) / 1000),
//     };
//   };
//   const [time, setTime] = useState(calc);
//   useEffect(() => {
//     const id = setInterval(() => setTime(calc()), 1000);
//     return () => clearInterval(id);
//   }, []);
//   return time;
// }
//
// const FlipDigit = ({ value }: { value: number }) => (
//   <span className="relative overflow-hidden inline-block h-[1.2em] w-[0.6em]">
//     <AnimatePresence mode="popLayout" initial={false}>
//       <motion.span
//         key={value}
//         className="absolute inset-0 flex items-center justify-center"
//         initial={{ y: "-60%", opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         exit={{ y: "60%", opacity: 0 }}
//         transition={{ duration: 0.3, ease: "easeInOut" }}
//       >
//         {value}
//       </motion.span>
//     </AnimatePresence>
//   </span>
// );
// ─────────────────────────────────────────────────────────────────────────────
// END REAL COUNTDOWN
// ─────────────────────────────────────────────────────────────────────────────

const UNITS = ["Days", "Hours", "Minutes", "Seconds"] as const;

type CountDownProps = {
  // targetDate?: Date;  // ← uncomment when date is confirmed (step 4 above)
  className?: string;
  boxClassName?: string;
  numberClassName?: string;
  labelClassName?: string;
  separatorClassName?: string;
};

const CountDown = ({
  className,
  boxClassName,
  numberClassName,
  labelClassName,
  separatorClassName,
}: CountDownProps) => {
  // const time = useCountdown(targetDate!); // ← uncomment when date is set (step 3)

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
            {/* ── PLACEHOLDER: delete this line, replace with FlipDigit below ── */}
            <GlowPulse
              className={cn(
                "text-white font-semibold tracking-[-4%]",
                numberClassName,
              )}
            />

            {/* ── REAL COUNTDOWN: uncomment when date is set (step 5) ──────────
            <span className={cn("flex", numberClassName)}>
              <FlipDigit
                value={Math.floor(
                  (index === 0 ? time.days :
                   index === 1 ? time.hours :
                   index === 2 ? time.minutes : time.seconds) / 10
                )}
              />
              <FlipDigit
                value={
                  (index === 0 ? time.days :
                   index === 1 ? time.hours :
                   index === 2 ? time.minutes : time.seconds) % 10
                }
              />
            </span>
            ── END REAL COUNTDOWN ─────────────────────────────────────────── */}

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
