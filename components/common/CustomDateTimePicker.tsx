"use client";

import { useState, useEffect, forwardRef, memo, useRef } from "react";
import { Icon } from "@iconify/react";
import { TimePicker } from "./TimePicker";
import type { ITimeUpdatePayload } from "./TimePicker";

const generateDaysInMonth = (year: number, month: number) => {
  const days: Date[] = [];
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = leadingDays; i > 0; i--) days.push(new Date(year, month - 1, prevMonthLastDate - i + 1));
  for (let i = 1; i <= totalDaysInMonth; i++) days.push(new Date(year, month, i));
  const trailingDays = 7 - (days.length % 7);
  if (trailingDays < 7) for (let i = 1; i <= trailingDays; i++) days.push(new Date(year, month + 1, i));
  return days;
};

export interface DateTimePickerProps {
  name?: string;
  error?: string;
  placeholder?: string;
  value?: string | number | null;
  disabled?: boolean;
  onChange?: (event: { target: { name?: string; value: string } }) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

const CustomDateTimePicker = memo(
  forwardRef<HTMLInputElement, DateTimePickerProps>(
    ({ name = "input", error, placeholder = "Select Date & Time", value, disabled, onChange, onBlur }, ref) => {
      const [finalDate, setFinalDate] = useState<Date | null>(null);
      const [isOpen, setIsOpen] = useState(false);
      const [pendingDate, setPendingDate] = useState(new Date());
      const [pendingSelectedTime, setPendingSelectedTime] = useState<ITimeUpdatePayload>({ hour: 12, minute: 0, second: 0, isAM: true });
      const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
      const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

      const initialYear = new Date().getFullYear();
      const minYear = initialYear - 50;
      const maxYear = initialYear + 10;

      const containerRef = useRef<HTMLDivElement>(null);
      const yearDropdownRef = useRef<HTMLDivElement>(null);
      const monthDropdownRef = useRef<HTMLDivElement>(null);

      const daysInMonth = generateDaysInMonth(pendingDate.getFullYear(), pendingDate.getMonth());

      const changeMonth = (offset: number) => {
        setPendingDate((prev) => {
          const targetMonth = prev.getMonth() + offset;
          const candidate = new Date(prev.getFullYear(), targetMonth, prev.getDate());
          return candidate.getMonth() !== ((targetMonth % 12) + 12) % 12
            ? new Date(prev.getFullYear(), targetMonth, 1)
            : candidate;
        });
      };

      const changeYear = (offset: number) => {
        setPendingDate((prev) => {
          const newYear = prev.getFullYear() + offset;
          const candidate = new Date(newYear, prev.getMonth(), prev.getDate());
          return candidate.getMonth() !== prev.getMonth() ? new Date(newYear, prev.getMonth(), 1) : candidate;
        });
      };

      const monthNames = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString("default", { month: "long" }));
      const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

      // Sync displayed value from ISO string or timestamp
      useEffect(() => {
        if (value) {
          const parsed = typeof value === "number" ? new Date(value * 1000) : new Date(value as string);
          if (!isNaN(parsed.getTime())) setFinalDate(parsed);
        } else {
          setFinalDate(null);
        }
      }, [value]);

      // Initialise pending state from committed date when opening
      useEffect(() => {
        if (isOpen) {
          const base = finalDate ?? new Date();
          setPendingDate(new Date(base));
          let hours = base.getHours();
          const isAM = hours < 12;
          if (hours === 0) hours = 12;
          if (hours > 12) hours -= 12;
          setPendingSelectedTime({ hour: hours, minute: base.getMinutes(), second: base.getSeconds(), isAM });
        }
      }, [isOpen]);

      // Close picker on outside click
      useEffect(() => {
        const handler = (e: MouseEvent) => {
          if (isOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
          if (isYearDropdownOpen && yearDropdownRef.current && !yearDropdownRef.current.contains(e.target as Node)) setIsYearDropdownOpen(false);
          if (isMonthDropdownOpen && monthDropdownRef.current && !monthDropdownRef.current.contains(e.target as Node)) setIsMonthDropdownOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
      }, [isOpen, isYearDropdownOpen, isMonthDropdownOpen]);

      const handleApply = () => {
        let hours = pendingSelectedTime.hour;
        if (!pendingSelectedTime.isAM && hours !== 12) hours += 12;
        if (pendingSelectedTime.isAM && hours === 12) hours = 0;
        const committed = new Date(
          pendingDate.getFullYear(), pendingDate.getMonth(), pendingDate.getDate(),
          hours, pendingSelectedTime.minute, pendingSelectedTime.second,
        );
        setFinalDate(committed);
        onChange?.({ target: { name, value: committed.toISOString() } });
        setIsOpen(false);
      };

      const handleClear = () => {
        setFinalDate(null);
        onChange?.({ target: { name, value: "" } });
        setIsOpen(false);
      };

      const displayValue = finalDate
        ? finalDate.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
        : "";

      return (
        <div ref={containerRef} className="relative w-full">
          {/* Trigger input */}
          <div className="relative">
            <input
              type="text"
              readOnly
              name={name}
              ref={ref}
              placeholder={placeholder}
              disabled={disabled}
              value={displayValue}
              onClick={() => !disabled && setIsOpen((v) => !v)}
              onBlur={onBlur}
              className={`h-[2.75rem] w-full cursor-pointer rounded-lg border bg-white py-[0.625rem] pl-[0.875rem] pr-10 text-[0.875rem] font-normal leading-[1.5rem] caret-transparent placeholder:text-[#D0D5DD] outline-none transition-colors ${
                error ? "border-[#FDA29B] text-[#F04438]" : "border-[#D0D5DD] text-[#374151]"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            />
            <Icon
              icon={error ? "hugeicons:information-circle" : "solar:calendar-bold-duotone"}
              className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${error ? "text-[#F04438]" : "text-[#9CA3AF]"}`}
            />
          </div>

          {/* Picker dropdown */}
          {isOpen && (
            <div
              className="absolute left-1/2 -translate-x-1/2 z-50 mt-1 min-w-[41rem] rounded-xl border border-[#EAECF0] bg-white shadow-xl"
              style={{ boxShadow: "0px 20px 24px -4px rgba(16,24,40,0.08), 0px 8px 8px -4px rgba(16,24,40,0.03)" }}
            >
              <div className="flex">
                {/* Calendar side */}
                <div className="flex flex-1 flex-col gap-3 border-r border-[#EAECF0] p-5">
                  <h4 className="py-2.5 text-[1rem] font-semibold text-[#344054]">Set Date</h4>

                  {/* Month + Year navigation */}
                  <div className="flex items-center justify-between">
                    {/* Month picker */}
                    <div ref={monthDropdownRef} className="relative flex items-center gap-1">
                      <button type="button" onClick={() => changeMonth(-1)} className="p-2 text-[#49454F] hover:text-[#111827]">
                        <Icon icon="solar:alt-arrow-left-bold" className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMonthDropdownOpen((v) => !v)}
                        className="flex items-center gap-1.5 px-1 py-0.5 text-[0.875rem] font-medium text-[#344054] hover:bg-[#F9FAFB] rounded-lg"
                      >
                        {monthNames[pendingDate.getMonth()].substring(0, 3)}
                        <Icon icon="solar:alt-arrow-down-bold" className={`w-3 h-3 transition-transform ${isMonthDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                      <button type="button" onClick={() => changeMonth(1)} className="p-2 text-[#49454F] hover:text-[#111827]">
                        <Icon icon="solar:alt-arrow-right-bold" className="w-4 h-4" />
                      </button>
                      {isMonthDropdownOpen && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10 mt-1 max-h-64 w-36 overflow-y-auto rounded-xl border border-[#EAECF0] bg-white p-1.5 shadow-lg">
                          {monthNames.map((mName, i) => (
                            <button
                              key={mName}
                              type="button"
                              onClick={() => {
                                setPendingDate((prev) => {
                                  const c = new Date(prev.getFullYear(), i, prev.getDate());
                                  return c.getMonth() === i ? c : new Date(prev.getFullYear(), i, 1);
                                });
                                setIsMonthDropdownOpen(false);
                              }}
                              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[0.8125rem] font-medium text-[#344054] transition-colors ${
                                i === pendingDate.getMonth() ? "bg-[#F9FAFB] text-[#101828]" : "hover:bg-[#F9FAFB]"
                              }`}
                            >
                              {mName}
                              {i === pendingDate.getMonth() && <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5 text-[#6EC93E]" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Year picker */}
                    <div ref={yearDropdownRef} className="relative flex items-center gap-1">
                      <button type="button" onClick={() => changeYear(-1)} disabled={pendingDate.getFullYear() <= minYear} className="p-2 text-[#49454F] hover:text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed">
                        <Icon icon="solar:alt-arrow-left-bold" className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsYearDropdownOpen((v) => !v)}
                        className="flex items-center gap-1.5 px-1 py-0.5 text-[0.875rem] font-medium text-[#344054] hover:bg-[#F9FAFB] rounded-lg"
                      >
                        {pendingDate.getFullYear()}
                        <Icon icon="solar:alt-arrow-down-bold" className={`w-3 h-3 transition-transform ${isYearDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                      <button type="button" onClick={() => changeYear(1)} disabled={pendingDate.getFullYear() >= maxYear} className="p-2 text-[#49454F] hover:text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed">
                        <Icon icon="solar:alt-arrow-right-bold" className="w-4 h-4" />
                      </button>
                      {isYearDropdownOpen && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10 mt-1 max-h-64 w-28 overflow-y-auto rounded-xl border border-[#EAECF0] bg-white p-1.5 shadow-lg">
                          {years.map((yr) => (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => {
                                setPendingDate((prev) => {
                                  const c = new Date(yr, prev.getMonth(), prev.getDate());
                                  return c.getMonth() === prev.getMonth() ? c : new Date(yr, prev.getMonth(), 1);
                                });
                                setIsYearDropdownOpen(false);
                              }}
                              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[0.8125rem] font-medium text-[#344054] transition-colors ${
                                yr === pendingDate.getFullYear() ? "bg-[#F9FAFB] text-[#101828]" : "hover:bg-[#F9FAFB]"
                              }`}
                            >
                              {yr}
                              {yr === pendingDate.getFullYear() && <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5 text-[#6EC93E]" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected date display */}
                  <div className="rounded-lg border border-[#D0D5DD] px-3.5 py-2 text-[0.875rem] font-normal text-[#101828] shadow-sm">
                    {pendingDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid w-full grid-cols-7 gap-y-1">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sat", "Su"].map((day) => (
                      <span key={day} className="flex aspect-square items-center justify-center text-[0.8125rem] font-medium text-[#344054]">{day}</span>
                    ))}
                    {daysInMonth.map((day, index) => {
                      const isCurrentMonth = day.getMonth() === pendingDate.getMonth();
                      const isSelected =
                        pendingDate.getDate() === day.getDate() &&
                        pendingDate.getMonth() === day.getMonth() &&
                        pendingDate.getFullYear() === day.getFullYear();
                      return (
                        <button
                          type="button"
                          key={`day-${index}`}
                          onClick={() => setPendingDate(day)}
                          className={`flex aspect-square items-center justify-center rounded-full text-[0.8125rem] font-normal transition-colors ${
                            isSelected
                              ? "border border-[#6EC93E] bg-[#6EC93E]/10 text-[#3a7a1e] font-semibold"
                              : isCurrentMonth
                                ? "text-[#344054] hover:bg-[#F3F4F6]"
                                : "text-[#D0D5DD]"
                          }`}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time side */}
                <TimePicker pendingSelectedTime={pendingSelectedTime} onChange={setPendingSelectedTime} />
              </div>

              {/* Apply / Cancel / Clear */}
              <div className="flex items-center justify-between gap-3 border-t border-[#EAECF0] px-5 py-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[0.8125rem] text-[#9CA3AF] hover:text-[#374151] transition-colors"
                >
                  Clear
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-[0.875rem] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="rounded-lg bg-[#6EC93E] px-4 py-2 text-[0.875rem] font-semibold text-white hover:bg-[#5cb535] transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    },
  ),
);

CustomDateTimePicker.displayName = "CustomDateTimePicker";

export { CustomDateTimePicker };
