import * as React from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/status";

const toneAccent: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-700",
  success: "bg-accent-50 text-accent-700",
  warn: "bg-warn-50 text-warn-600",
  danger: "bg-danger-50 text-danger-600",
  info: "bg-brand-50 text-brand-700",
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-ink-100 shadow-card p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-semibold text-ink-900 mt-2">
            {value}
          </p>
          {hint && <p className="text-xs text-ink-500 mt-1.5">{hint}</p>}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
              toneAccent[tone],
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
