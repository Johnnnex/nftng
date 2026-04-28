"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

const ReducedMotionContext = createContext(false);

export const useReducedMotion = () => useContext(ReducedMotionContext);

const subscribe = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const getSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getServerSnapshot = () => false;

export const MotionProvider = ({ children }: { children: React.ReactNode }) => {
  const reduced = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <ReducedMotionContext.Provider value={reduced}>
      {children}
    </ReducedMotionContext.Provider>
  );
};
