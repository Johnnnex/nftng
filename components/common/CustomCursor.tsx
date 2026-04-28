"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib";
import { useReducedMotion } from "@/components/providers/MotionProvider";

const noopSubscribe = () => () => {};
const getVisible = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const getServerVisible = () => false;

const CustomCursor = () => {
  const reduced = useReducedMotion();
  const visible = useSyncExternalStore(noopSubscribe, getVisible, getServerVisible);
  const outerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -200, y: -200 });
  const pos = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number>(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      if (reduced) {
        pos.current = { ...mouse.current };
      } else {
        pos.current.x = lerp(pos.current.x, mouse.current.x, 0.11);
        pos.current.y = lerp(pos.current.y, mouse.current.y, 0.11);
      }
      if (outerRef.current) {
        outerRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const onOver = (e: MouseEvent) => {
      const el = (e.target as Element).closest("a, button, [data-cursor]");
      setHovered(!!el);
    };
    document.addEventListener("mouseover", onOver);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(rafRef.current);
    };
  }, [reduced, visible]);

  if (!visible) return null;

  return (
    <div
      ref={outerRef}
      className="pointer-events-none fixed left-0 top-0 z-9999 -translate-x-1/2 -translate-y-1/2"
      aria-hidden
    >
      <span
        className={cn(
          "block rounded-full bg-[#6EC93E] transition-[width,height] duration-200",
          hovered ? "w-5 h-5 opacity-70" : "w-2.5 h-2.5 opacity-100",
        )}
      />
    </div>
  );
};

export { CustomCursor };
