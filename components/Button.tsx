import type { ComponentPropsWithoutRef, PropsWithChildren } from "react";
import { cn } from "@/lib";

type ButtonProps = PropsWithChildren<{
  className?: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}> &
  ComponentPropsWithoutRef<"button">;

const Button = ({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "p-[.5625rem_.8125rem] sm:p-[.625rem_2.125rem] rounded-[.625rem] text-[.875rem] cursor-pointer",
        variant === "primary" ? "btn-glaze-primary" : "btn-glaze-secondary",
        variant === "primary"
          ? "bg-[#6EC93E] text-white"
          : "text-black border border-[#6EC93E]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
