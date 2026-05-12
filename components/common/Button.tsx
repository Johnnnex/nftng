import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
  url?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const baseCls = (variant: "primary" | "secondary", className?: string) =>
  cn(
    "p-[.5625rem_.8125rem] sm:p-[.625rem_2.125rem] transition-all duration-200 rounded-[.625rem] text-[.875rem] cursor-pointer",
    variant === "primary"
      ? "bg-[#6EC93E] focus:bg-[#589a35] btn-glaze-primary text-white"
      : "text-black focus:bg-[#f8f8f8] btn-glaze-secondary border border-[#6EC93E]",
    className,
  );

const Button = ({
  children,
  className,
  variant = "primary",
  url,
  target,
  ...rest
}: ButtonProps) => {
  const cls = baseCls(variant, className);

  if (url) {
    const isExternal =
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("mailto:") ||
      url.startsWith("tel:");

    if (isExternal) {
      return (
        <a href={url} target={target ?? "_blank"} rel="noopener noreferrer" className={cls}>
          {children}
        </a>
      );
    }

    return (
      <Link href={url} target={target} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
};

export { Button };
export type { ButtonProps };
