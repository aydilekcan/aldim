import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "block w-full min-h-[96px] px-3.5 py-2.5 rounded-xl bg-white border border-ink-200",
        "text-sm text-ink-900 placeholder:text-ink-400",
        "focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none",
        "resize-y",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
