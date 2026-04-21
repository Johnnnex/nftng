import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib";

type InputProps = {
  className?: string;
} & ComponentPropsWithoutRef<"input">;

const Input = ({ className, ...props }: InputProps) => {
  return (
    <input
      className={cn(
        "bg-white h-11 text-[.625rem] font-normal text-[#000000B2] outline-none p-[.875rem_.625rem] rounded-lg",
        className,
      )}
      {...props}
    />
  );
};

export { Input };
