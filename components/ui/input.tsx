import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "block w-full h-11 px-3.5 rounded-xl bg-white border border-ink-200",
        "text-sm text-ink-900 placeholder:text-ink-400",
        "focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none",
        "disabled:bg-ink-50 disabled:text-ink-400",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
