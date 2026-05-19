import Link from "next/link";
import { ChevronRight, ShieldCheck, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductStatusBadge } from "@/components/status-badge";
import {
  returnStatus,
  returnStatusTone,
  RETURN_STATUS_LABEL,
  riskLevel,
  warrantyStatus,
  warrantyStatusTone,
  WARRANTY_STATUS_LABEL,
} from "@/lib/status";
import type { Product, RiskLevel } from "@/lib/types";
import { cn, formatCurrencyTRY, formatDateTR } from "@/lib/utils";
import { humanizeDaysLeft } from "@/lib/date-utils";

// Düşük risk: şerit gizli — gereksiz görsel gürültü yapma.
const RISK_STRIPE: Record<RiskLevel, string> = {
  low: "bg-transparent",
  medium: "bg-warn-400",
  high: "bg-danger-500",
};

export function ProductCard({
  product,
  warrantyWarnDays,
  returnWarnDays,
}: {
  product: Product;
  warrantyWarnDays: number;
  returnWarnDays: number;
}) {
  const w = warrantyStatus(product, warrantyWarnDays);
  const r = returnStatus(product, returnWarnDays);
  const risk = riskLevel(product);

  return (
    <Link
      href={`/app/products/${product.id}`}
      className="group relative flex flex-col gap-4 rounded-2xl bg-white border border-ink-100 shadow-card p-5 pl-6 hover:border-brand-200 hover:shadow-pop transition overflow-hidden"
    >
      <span
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1.5",
          RISK_STRIPE[risk],
        )}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <Badge tone="neutral">{product.category}</Badge>
            <ProductStatusBadge status={product.status} />
          </div>
          <h3 className="text-base font-semibold text-ink-900 truncate">
            {product.name}
          </h3>
          <p className="text-sm text-ink-500 mt-0.5 truncate">
            {product.brand} · {product.store}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-semibold text-ink-900 tabular-nums">
            {formatCurrencyTRY(product.price)}
          </p>
          <p className="text-xs text-ink-500 mt-0.5">
            {formatDateTR(product.purchaseDate)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        <div className="flex items-start gap-2 min-w-0">
          <ShieldCheck className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <Badge dot tone={warrantyStatusTone(w)}>
              {WARRANTY_STATUS_LABEL[w]}
            </Badge>
            <p className="text-ink-500 mt-1 truncate">
              {humanizeDaysLeft(product.warrantyEndDate)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 min-w-0">
          <RotateCcw className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <Badge dot tone={returnStatusTone(r)}>
              {RETURN_STATUS_LABEL[r]}
            </Badge>
            <p className="text-ink-500 mt-1 truncate">
              {product.returnProcess
                ? `Talep: ${formatDateTR(product.returnProcess.requestDate)}`
                : humanizeDaysLeft(product.returnDeadline)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-ink-100 text-xs text-ink-500">
        <span>Garanti bitiş: {formatDateTR(product.warrantyEndDate)}</span>
        <span className="inline-flex items-center text-sm font-medium text-brand-700 group-hover:text-brand-800">
          Detay
          <ChevronRight className="h-4 w-4 ml-0.5" />
        </span>
      </div>
    </Link>
  );
}
