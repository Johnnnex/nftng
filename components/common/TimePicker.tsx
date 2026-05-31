"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState, useEffect } from "react";

const ScrollPicker = ({
  items,
  selected,
  onSelect,
  itemHeight = 40,
  width = "2.75rem",
}: {
  items: (string | number)[];
  onSelect?: (payload: string | number) => void;
  selected: string | number;
  width?: string;
  itemHeight?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Prevents the handleScroll from firing while a programmatic scroll is in progress.
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isProgrammaticScroll.current = true;
    if (containerRef.current) {
      const index = items.indexOf(selected);
      if (index !== -1) {
        containerRef.current.scrollTo({ top: index * itemHeight, behavior: "smooth" });
      }
    }
    const timer = setTimeout(() => { isProgrammaticScroll.current = false; }, 300);
    return () => clearTimeout(timer);
  }, [selected]);

  const handleScroll = () => {
    if (isProgrammaticScroll.current) return;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const index = Math.round(containerRef.current.scrollTop / itemHeight);
      if (items[index] !== selected) onSelect?.(items[index]);
    }, 100);
  };

  const handleClick = (index: number) => {
    containerRef.current?.scrollTo({ top: index * itemHeight, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative", width, height: itemHeight * 3, overflow: "hidden" }}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="hide-scrollbar"
        style={{ height: "100%", overflowY: "scroll", scrollSnapType: "y mandatory", paddingTop: itemHeight, paddingBottom: itemHeight }}
      >
        {items.map((item, index) => (
          <button
            type="button"
            onClick={() => handleClick(index)}
            key={`scroll-${item}-${index}`}
            className="flex w-full items-center justify-center text-[1rem]"
            style={{
              height: itemHeight,
              scrollSnapAlign: "center",
              fontWeight: selected === item ? "600" : "500",
              color: selected === item ? "#344054" : "#667085",
            }}
          >
            {+item < 10 ? `0${item}` : item}
          </button>
        ))}
      </div>
      <div
        className="border-b border-t border-[#EAECF0]"
        style={{ position: "absolute", top: itemHeight, left: 0, right: 0, height: itemHeight, pointerEvents: "none" }}
      />
    </div>
  );
};

export interface ITimeUpdatePayload {
  hour: number;
  minute: number;
  second: number;
  isAM: boolean;
}

const TimePicker = ({
  pendingSelectedTime,
  onChange,
}: {
  pendingSelectedTime?: ITimeUpdatePayload;
  onChange?: (update: ITimeUpdatePayload) => void;
}) => {
  const getInitialTime = (): ITimeUpdatePayload => {
    if (pendingSelectedTime) return pendingSelectedTime;
    const now = new Date();
    let hour = now.getHours();
    const isAM = hour < 12;
    if (hour === 0) hour = 12;
    if (hour > 12) hour -= 12;
    return { hour, minute: now.getMinutes(), second: now.getSeconds(), isAM };
  };

  const [selectedTime, setSelectedTime] = useState<ITimeUpdatePayload>({ hour: 12, minute: 0, second: 0, isAM: true });
  const lastEmittedTime = useRef<ITimeUpdatePayload | null>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setSelectedTime(getInitialTime()); }, [JSON.stringify(pendingSelectedTime)]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const seconds = Array.from({ length: 60 }, (_, i) => i);
  const meridiems = ["AM", "PM"];

  useEffect(() => {
    if (JSON.stringify(selectedTime) !== JSON.stringify(lastEmittedTime.current) && JSON.stringify(selectedTime) !== JSON.stringify(pendingSelectedTime)) {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        onChange?.(selectedTime);
        lastEmittedTime.current = selectedTime;
      }, 200);
    }
    return () => { if (debounceTimeout.current) clearTimeout(debounceTimeout.current); };
  }, [JSON.stringify(selectedTime)]);

  const handleSelect = (key: string, value: number | boolean) => {
    setSelectedTime((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-w-[17.875rem] p-[1.25rem_1.5rem]">
      <h4 className="py-[.625rem] text-[1.02rem] font-[600] text-[#344054]">Set Time</h4>
      <div className="flex">
        {[
          { label: "HR", items: hours, value: selectedTime.hour, key: "hour" },
          { label: "MIN", items: minutes, value: selectedTime.minute, key: "minute" },
          { label: "SEC", items: seconds, value: selectedTime.second, key: "second" },
        ].map(({ label, items, value, key }) => (
          <div key={key}>
            <h5 className="flex items-center justify-center p-[.625rem_.5rem] text-[1rem] font-[500] leading-[1.25rem] text-[#344054]">{label}</h5>
            <ScrollPicker items={items} selected={value} onSelect={(v) => handleSelect(key, Number(v))} />
          </div>
        ))}
        <div>
          <h5 className="flex items-center justify-center p-[.625rem_.5rem] text-[1rem] font-[500] leading-[1.25rem] text-[#344054]">MER</h5>
          <ScrollPicker items={meridiems} selected={selectedTime.isAM ? "AM" : "PM"} onSelect={(v) => handleSelect("isAM", v === "AM")} />
        </div>
      </div>
      <p className="mt-4 text-[0.875rem] text-[#344054]">
        {selectedTime.hour}:{String(selectedTime.minute).padStart(2, "0")}:{String(selectedTime.second).padStart(2, "0")} {selectedTime.isAM ? "AM" : "PM"}
      </p>
    </div>
  );
};

export { TimePicker };
