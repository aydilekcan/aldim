import * as React from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/status";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-ink-50 border-ink-200 text-ink-700",
  success: "bg-accent-50 border-accent-200 text-accent-800",
  warn: "bg-warn-50 border-warn-100 text-warn-700",
  danger: "bg-danger-50 border-danger-100 text-danger-700",
  info: "bg-brand-50 border-brand-100 text-brand-800",
};

const barStyles: Record<Tone, string> = {
  neutral: "bg-ink-400",
  success: "bg-accent-500",
  warn: "bg-warn-500",
  danger: "bg-danger-500",
  info: "bg-brand-500",
};

const iconRingStyles: Record<Tone, string> = {
  neutral: "bg-white text-ink-600",
  success: "bg-white text-accent-700",
  warn: "bg-white text-warn-600",
  danger: "bg-white text-danger-600",
  info: "bg-white text-brand-700",
};

export function AlertBanner({
  tone = "info",
  icon,
  title,
  description,
  action,
  className,
}: {
  tone?: Tone;
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-2xl border pl-4 pr-4 py-3.5 overflow-hidden",
        toneStyles[tone],
        className,
      )}
    >
      <span className={cn("absolute left-0 top-0 bottom-0 w-1", barStyles[tone])} />
      {icon && (
        <div
          className={cn(
            "shrink-0 h-8 w-8 rounded-xl flex items-center justify-center shadow-sm",
            iconRingStyles[tone],
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-snug">{title}</p>
        {description && (
          <p className="text-xs mt-0.5 opacity-90">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
