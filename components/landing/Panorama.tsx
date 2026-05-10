/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useTextScramble } from "@/hooks/useTextScramble";
import { SVGClient, useReducedMotion } from "@/components";
import { cn } from "@/lib";

// ─── ViewScramble ─────────────────────────────────────────────────────────────
// Scrambles once when the element scrolls into view

const ViewScramble = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const output = useTextScramble(text, inView);
  return (
    <span ref={ref} className={cn(className)}>
      {output}
    </span>
  );
};

// ─── CyclingImage ─────────────────────────────────────────────────────────────
// Cross-fades through a list of image paths on a fixed interval.
// `offset` staggers the start so multiple slots never cycle simultaneously.

const CyclingImage = ({
  images,
  interval = 3500,
  offset = 0,
  alt,
  reduced,
}: {
  images: string[];
  interval?: number;
  offset?: number;
  alt?: string;
  reduced: boolean;
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || images.length <= 1) return;
    let clearInt: (() => void) | null = null;
    const start = setTimeout(() => {
      const id = setInterval(
        () => setIndex((p) => (p + 1) % images.length),
        interval,
      );
      clearInt = () => clearInterval(id);
    }, offset);
    return () => {
      clearTimeout(start);
      clearInt?.();
    };
  }, [images, interval, offset, reduced]);

  if (reduced) {
    return (
      <img
        className="absolute inset-0 h-full w-full object-cover"
        src={images[0]}
        alt={alt ?? ""}
      />
    );
  }

  return (
    <AnimatePresence initial={false}>
      <motion.img
        key={images[index]}
        src={images[index]}
        alt={alt ?? ""}
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />
    </AnimatePresence>
  );
};

// ─── Pre-computed image arrays (stable module-level references) ───────────────

const SOCCER_IMAGES = Array.from({ length: 3 }, (_, slot) =>
  Array.from(
    { length: 4 },
    (_, v) => `/images/soccer-${slot + 1}.${v + 1}.png`,
  ),
);

const EMPOWERMENT_IMAGES = Array.from({ length: 2 }, (_, slot) =>
  Array.from(
    { length: 2 },
    (_, v) => `/images/empowerment-${slot + 1}.${v + 1}.png`,
  ),
);

const CONFERENCE_IMAGES = Array.from({ length: 4 }, (_, slot) =>
  Array.from(
    { length: 3 },
    (_, v) => `/images/conference-${slot + 1}.${v + 1}.png`,
  ),
);

const SIDE_EVENT_IMAGES = Array.from({ length: 2 }, (_, slot) =>
  Array.from(
    { length: 5 },
    (_, v) => `/images/side-event-${slot + 1}.${v + 1}.png`,
  ),
);

const SOCCER_INTERVAL = 4000;
const EMPOWERMENT_INTERVAL = 5000;
const CONFERENCE_INTERVAL = 3500;
const SIDE_EVENT_INTERVAL = 3000;

// ─── Panorama ─────────────────────────────────────────────────────────────────

const metricCls =
  "text-[2.5rem] leading-9.5 tracking-[-7%] font-light text-white";

const Panorama = () => {
  const reduced = useReducedMotion();

  return (
    <div className="grid grid-cols-100 gap-0.75 md:gap-1.5 lg:gap-2 lg:grid-rows-[repeat(100,.375rem)] mb-10 md:mb-15">
      {/* ── Row Category One ─────────────────────────────────────── */}

      {/* 10M+ */}
      <div className="lg:col-span-12 overflow-hidden p-[1rem_0_0_0.9375rem] col-span-57 sm:col-span-50 md:col-span-34 h-32 sm:h-36 md:h-40 lg:h-full lg:row-span-12 bg-[#111111] relative">
        <div className="flex gap-px flex-col">
          <ViewScramble text="10M+" className={metricCls} />
          <span className="max-w-19 text-[.625rem] leading-2.75 font-light tracking-[-7%] text-white">
            Social Impresions (1 year)
          </span>
        </div>
        <SVGClient className="absolute bottom-0 right-0" src="/svg/chain.svg" />
        <span className="absolute rounded-[50%] w-[calc(100%+2rem)] h-10.5 bg-[#FFAD33] -left-4 blur-[94px] -bottom-8.5" />
      </div>

      {/* 50+ */}
      <div className="lg:col-span-12 col-span-43 sm:col-span-50 md:col-span-33 overflow-hidden bg-[#111111] p-[1rem_0_0_0.9375rem] relative h-32 sm:h-36 md:h-40 lg:h-full lg:row-span-12">
        <div className="flex gap-px flex-col">
          <ViewScramble text="50+" className={metricCls} />
          <span className="max-w-19 text-[.625rem] leading-2.75 font-light tracking-[-7%] text-white">
            Partner projects
          </span>
        </div>
        <SVGClient
          className="absolute bottom-0 right-0"
          src="/svg/chain-v2.svg"
        />
        <span className="absolute rounded-[50%] w-[calc(100%+2rem)] h-10.5 bg-[#6EC93E] -left-4 blur-[94px] -bottom-8.5" />
      </div>

      {/* Best */}
      <div className="lg:col-span-18 col-span-60 sm:col-span-50 md:col-span-33 h-32 sm:h-36 md:h-40 lg:h-full row-start-4 md:row-start-auto lg:row-start-auto lg:row-span-12 relative p-[1.25rem_0_0_1.3125rem] overflow-hidden bg-[#111111]">
        <div className="flex flex-col">
          <span className="text-white leading-2.75 font-light text-[.625rem] tracking-[-7%]">
            Nominated as
          </span>
          <ViewScramble
            text="Best"
            className="text-[2.5rem] font-light leading-9.5 tracking-[-7%] text-white mb-px -left-0.5 relative"
          />
          <span className="text-white text-[.625rem] leading-2.75 font-light tracking-[-7%]">
            Web3 event (2024)
          </span>
        </div>
        <SVGClient className="absolute bottom-0 right-0" src="/svg/medal.svg" />
        <span className="absolute rounded-[50%] w-[calc(100%+2rem)] h-10.5 bg-[#FFAD33] -left-4 blur-[94px] -bottom-8.5" />
      </div>

      {/* Soccer Tournament */}
      <div className="lg:col-span-29 col-span-100 sm:col-span-50 md:col-span-50 aspect-[1.4078] lg:aspect-auto row-start-6 md:row-start-5 lg:row-start-auto lg:row-span-27 flex flex-col gap-2">
        <div className="flex py-6.75 bg-center bg-cover bg-[url(/images/polygon-bg.png)] bg-[#0D0D0D] items-center justify-center">
          <h5 className="max-w-55.5 text-white text-[2.25rem] md:text-[2.5rem] font-normal leading-7.25 md:leading-9.5 tracking-[-7%] text-center">
            Soccer Tournament
          </h5>
        </div>
        <div className="grid grid-cols-3 flex-1">
          {Array.from({ length: 3 }, (_, slot) => (
            <figure key={slot} className="relative h-full w-full">
              <CyclingImage
                images={SOCCER_IMAGES[slot]}
                interval={SOCCER_INTERVAL}
                offset={(slot * SOCCER_INTERVAL) / 3}
                alt={`Soccer Tournament ${slot + 1}`}
                reduced={reduced}
              />
            </figure>
          ))}
        </div>
      </div>

      {/* Empowerment */}
      <div className="lg:col-span-29 col-span-100 sm:col-span-50 md:col-span-50 aspect-[1.401] lg:aspect-auto row-start-10 sm:row-start-6 md:row-start-5 lg:row-start-auto lg:row-span-27 flex flex-col-reverse sm:flex-col">
        <div className="py-7.5 pl-5.25 md:pl-6.75 bg-black">
          <h6 className="text-[2.25rem] md:text-[2.5rem] leading-9.5 tracking-[-7%] font-normal text-white">
            Empowerment
          </h6>
        </div>
        <div className="grid grid-cols-2 overflow-hidden flex-1">
          {Array.from({ length: 2 }, (_, slot) => (
            <figure key={slot} className="relative h-full w-full">
              <CyclingImage
                images={EMPOWERMENT_IMAGES[slot]}
                interval={EMPOWERMENT_INTERVAL}
                offset={(slot * EMPOWERMENT_INTERVAL) / 2}
                alt={`Empowerment ${slot + 1}`}
                reduced={reduced}
              />
            </figure>
          ))}
        </div>
      </div>

      {/* ── Row Category Two ─────────────────────────────────────── */}

      {/* 20K+ */}
      <div className="lg:col-span-12 col-span-40 sm:col-span-50 md:col-span-34 h-32 sm:h-36 md:h-40 lg:h-full row-start-2 lg:row-start-auto lg:row-span-13 p-[1.1875rem_0_0_.875rem] relative bg-[#111111] overflow-hidden">
        <div className="flex flex-col">
          <ViewScramble text="20K+" className={metricCls} />
          <span className="max-w-24 text-white text-[.625rem] leading-2.75 font-light tracking-[-7%]">
            Registered Ecosystem Users
          </span>
        </div>
        <SVGClient
          className="absolute bottom-0 right-0"
          src="/svg/user-group.svg"
        />
        <span className="absolute rounded-[50%] w-[calc(100%+2rem)] h-10.5 bg-[#6EC93E] -left-4 blur-[94px] -bottom-5.25" />
      </div>

      {/* 300K+ */}
      <div className="lg:col-span-18 col-span-60 sm:col-span-50 md:col-span-33 h-32 sm:h-36 md:h-40 lg:h-full row-start-2 lg:row-start-auto lg:row-span-13 relative overflow-hidden p-[1.1875rem_0_0_.875rem] bg-[#111111]">
        <div className="flex flex-col">
          <ViewScramble text="300K+" className={metricCls} />
          <span className="text-white text-[.625rem] leading-2.75 font-light tracking-[-7%]">
            Website visits (30 days)
          </span>
        </div>
        <SVGClient className="absolute bottom-0 right-0" src="/svg/globe.svg" />
        <span className="absolute rounded-[50%] w-[calc(100%-2.5rem)] h-10.5 bg-[#FFAD33] left-5 blur-[94px] -bottom-5.25" />
      </div>

      {/* 10+ */}
      <div className="lg:col-span-12 col-span-40 sm:col-span-50 md:col-span-33 col-start-1 sm:col-start-auto lg:col-start-auto h-32 sm:h-36 md:h-40 lg:h-full row-start-4 md:row-start-2 lg:row-start-auto lg:row-span-13 relative overflow-hidden p-[1.1875rem_0_0_.875rem] bg-[#111111]">
        <div className="flex flex-col">
          <ViewScramble text="10+" className={metricCls} />
          <span className="text-white text-[.625rem] leading-2.75 font-light tracking-[-7%]">
            Events done
          </span>
        </div>
        <SVGClient
          className="absolute bottom-0 right-2.25"
          src="/svg/calendar.svg"
        />
        <span className="absolute rounded-[50%] w-[calc(100%+2rem)] h-10.5 bg-[#6EC93E] -left-4 blur-[94px] -bottom-5.25" />
      </div>

      {/* ── Row Category Three ───────────────────────────────────── */}

      {/* 3K+ */}
      <div className="lg:col-span-20 col-span-65 sm:col-span-50 md:col-span-50 h-32 sm:h-36 md:h-40 lg:h-full row-start-3 lg:row-start-auto lg:row-span-13 relative overflow-hidden p-[1.25rem_0_0_.875rem] bg-[#111111]">
        <div className="flex flex-col">
          <ViewScramble text="3K+" className={metricCls} />
          <span className="text-white text-[.625rem] leading-2.75 font-light tracking-[-7%]">
            Livestream viewers
          </span>
        </div>
        <SVGClient className="absolute bottom-0 right-3.75" src="/svg/tv.svg" />
        <span className="absolute rounded-[50%] w-[calc(100%-4.375rem)] h-10.5 bg-[#FFAD33] left-8.75 blur-[94px] -bottom-5.25" />
      </div>

      {/* 8K+ */}
      <div className="lg:col-span-20 col-span-35 sm:col-span-50 md:col-span-50 h-32 sm:h-36 md:h-40 lg:h-full row-start-3 lg:row-start-auto lg:row-span-13 relative overflow-hidden p-[1.25rem_0_0_.875rem] bg-[#111111]">
        <div className="flex flex-col">
          <ViewScramble text="8K+" className={metricCls} />
          <span className="text-white text-[.625rem] leading-2.75 font-light tracking-[-7%]">
            Onsite attendees
          </span>
        </div>
        <SVGClient
          className="absolute bottom-0 right-0"
          src="/svg/globe-v2.svg"
        />
        <span className="absolute rounded-[50%] w-[calc(100%-4.375rem)] h-10.5 bg-[#6EC93E] left-8.75 blur-[94px] -bottom-5.25" />
      </div>

      {/* Meetups (static) */}
      <div className="lg:col-span-33 col-span-100 sm:col-span-50 md:col-span-50 aspect-[.98] lg:aspect-auto row-start-8 sm:row-start-7 md:row-start-6 lg:row-start-auto lg:row-span-40 flex flex-col sm:gap-2">
        <div className="grid flex-1 grid-cols-2 grid-rows-2">
          {Array.from({ length: 4 }, (_, index) => (
            <figure key={index}>
              <img
                className="h-full w-full object-cover"
                src={`/images/meetup-${index + 1}.png`}
                alt={`Meetup ${index + 1}`}
              />
            </figure>
          ))}
        </div>
        <div className="py-6.25 pl-5.25 md:pl-10.25 bg-black">
          <h6 className="md:text-[2.5rem] text-[2.25rem] leading-9.5 tracking-[-7%] font-normal text-white">
            Meetups
          </h6>
        </div>
      </div>

      {/* Echofi (static) */}
      <div className="lg:col-span-27 col-span-100 sm:col-span-50 md:col-span-50 aspect-[.96] lg:aspect-auto row-start-7 md:row-start-6 lg:row-start-auto lg:row-span-40 bg-[url(/images/grad-bg.png)] bg-center bg-cover bg-[#010101] flex items-center justify-center">
        <SVGClient src="/svg/echofi.svg" />
      </div>

      {/* ── Row Category Four ────────────────────────────────────── */}

      {/* Side Events */}
      <div className="lg:col-span-40 col-span-100 aspect-[1.76] lg:aspect-auto row-start-9 sm:row-start-8 md:row-start-7 lg:row-start-auto lg:row-span-29 flex flex-col-reverse lg:flex-col">
        <div className="p-[1.75rem_0_1.375rem_1.1875rem] bg-black">
          <h6 className="text-[2.25rem] md:text-[2.5rem] leading-9.5 tracking-[-7%] font-normal text-white">
            Side Events
          </h6>
        </div>
        <div className="grid flex-1 grid-cols-2">
          {Array.from({ length: 2 }, (_, slot) => (
            <figure key={slot} className="relative h-full w-full">
              <CyclingImage
                images={SIDE_EVENT_IMAGES[slot]}
                interval={SIDE_EVENT_INTERVAL}
                offset={(slot * SIDE_EVENT_INTERVAL) / 2}
                alt={`Side Event ${slot + 1}`}
                reduced={reduced}
              />
            </figure>
          ))}
        </div>
      </div>

      {/* ── Row Category Five ────────────────────────────────────── */}

      {/* Conferences */}
      <div className="col-span-100 aspect-[.9243] lg:aspect-auto row-start-5 md:row-start-4 lg:row-start-auto lg:row-span-33 flex flex-col sm:gap-2">
        <div className="grid flex-1 grid-cols-2 grid-rows-2 lg:grid-rows-1 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, slot) => (
            <figure key={slot} className="relative h-full w-full">
              <CyclingImage
                images={CONFERENCE_IMAGES[slot]}
                interval={CONFERENCE_INTERVAL}
                offset={(slot * CONFERENCE_INTERVAL) / 4}
                alt={`Conference ${slot + 1}`}
                reduced={reduced}
              />
            </figure>
          ))}
        </div>
        <div className="py-6.25 pl-5.25 bg-black">
          <h6 className="text-[2.25rem] md:text-[2.5rem] leading-9.5 tracking-[-7%] font-normal text-white">
            Conferences
          </h6>
        </div>
      </div>
    </div>
  );
};

export { Panorama };
