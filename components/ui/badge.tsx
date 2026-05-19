import * as React from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/status";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-700 ring-ink-200",
  success: "bg-accent-50 text-accent-700 ring-accent-200",
  warn: "bg-warn-50 text-warn-600 ring-warn-100",
  danger: "bg-danger-50 text-danger-600 ring-danger-100",
  info: "bg-brand-50 text-brand-700 ring-brand-100",
};

const dotStyles: Record<Tone, string> = {
  neutral: "bg-ink-400",
  success: "bg-accent-500",
  warn: "bg-warn-500",
  danger: "bg-danger-500",
  info: "bg-brand-500",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Sol tarafa küçük renkli nokta ekler — durum göstergeleri için. */
  dot?: boolean;
}

export function Badge({
  className,
  tone = "neutral",
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[tone])} />}
      {children}
    </span>
  );
}
