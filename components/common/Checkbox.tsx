"use client";

import { useState, useEffect, forwardRef, type ReactNode } from "react";
import { Icon } from "@iconify/react";

interface CheckBoxProps {
  label?: string;
  customLabel?: ReactNode;
  value?: boolean;
  isRequired?: boolean;
  onChange?: (checked: boolean) => void;
  state?: "correct" | "incorrect";
}

const CheckBox = forwardRef<HTMLLabelElement, CheckBoxProps>(
  ({ label, customLabel, value, isRequired = false, onChange, state }, ref) => {
    const [internalChecked, setInternalChecked] = useState(false);

    const isControlled = value !== undefined;

    const handleToggle = () => {
      if (!isControlled) setInternalChecked((prev) => !prev);
      if (onChange) onChange(isControlled ? !value : !internalChecked);
    };

    useEffect(() => {
      if (isControlled) setInternalChecked(value);
    }, [value, isControlled]);

    const isChecked = isControlled ? value : internalChecked;
    const showIcon = state === "correct" || state === "incorrect" || isChecked;

    const borderAndTextColor =
      state === "correct"
        ? "border-green-500 text-green-500"
        : state === "incorrect"
          ? "border-red-500 text-red-500"
          : isChecked
            ? "border-[#6EC93E] text-[#6EC93E]"
            : "border-[#D0D5DD] text-[#D0D5DD]";

    const iconName = state === "incorrect" ? "lucide:x" : "lucide:check";

    return (
      <label ref={ref} className="relative flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={isChecked}
          required={isRequired}
          onChange={handleToggle}
          className="sr-only"
        />
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border bg-white transition-colors duration-200 ${borderAndTextColor}`}
        >
          {showIcon && (
            <Icon icon={iconName} width=".875rem" height=".875rem" color="inherit" />
          )}
        </div>
        {customLabel ? (
          customLabel
        ) : (
          <span className="ml-2 text-[0.875rem] font-normal text-black">{label}</span>
        )}
      </label>
    );
  },
);

CheckBox.displayName = "Checkbox";

export { CheckBox };
