import { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/providers/MotionProvider";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";

export const useTextScramble = (text: string, trigger: boolean) => {
  const [output, setOutput] = useState(text);
  const rafRef = useRef<number>(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!trigger || reduced) {
      setOutput(text);
      return;
    }

    let frame = 0;
    const total = 20;

    const run = () => {
      const progress = frame / total;
      setOutput(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (char === "'") return "'";
            if (progress > i / text.length) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join(""),
      );
      frame++;
      if (frame <= total) rafRef.current = requestAnimationFrame(run);
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger, text, reduced]);

  return output;
};
