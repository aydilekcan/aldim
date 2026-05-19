import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

export function QuickActionCard({
  href,
  icon,
  title,
  description,
  className,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-3 rounded-2xl bg-white border border-ink-100 shadow-card p-4",
        "hover:border-brand-200 hover:shadow-pop transition",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 shrink-0 group-hover:bg-brand-100">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        {description && (
          <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
