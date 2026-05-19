import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-ink-900 font-semibold tracking-tight",
        className,
      )}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
        <span className="text-sm font-bold">A</span>
      </span>
      <span className="text-lg">Aldım</span>
    </Link>
  );
}
