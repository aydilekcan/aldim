"use client";

import { useMemo } from "react";
import Link from "next/link";
import { RotateCcw, ArrowRight, Truck, Calendar, Package } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReturnStatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { useAldimStore } from "@/lib/store";
import { daysUntil, humanizeDaysLeft } from "@/lib/date-utils";
import { formatCurrencyTRY, formatDateTR } from "@/lib/utils";

export default function ReturnsPage() {
  const { products, settings, hydrated } = useAldimStore();

  const inProgress = useMemo(
    () =>
      products
        .filter((p) => p.returnProcess && p.returnProcess.status !== "completed")
        .sort((a, b) =>
          (a.returnProcess?.requestDate ?? "").localeCompare(
            b.returnProcess?.requestDate ?? "",
          ),
        ),
    [products],
  );

  const upcoming = useMemo(
    () =>
      products
        .filter((p) => {
          if (p.returnProcess) return false;
          const d = daysUntil(p.returnDeadline);
          return d >= 0 && d <= settings.returnWarnDays;
        })
        .sort((a, b) => a.returnDeadline.localeCompare(b.returnDeadline)),
    [products, settings],
  );

  const completed = useMemo(
    () => products.filter((p) => p.returnProcess?.status === "completed"),
    [products],
  );

  return (
    <div>
      <PageHeader
        title="İade süreçleri"
        description="Başlattığın iadeleri ve süresi yaklaşan ürünleri buradan yönet."
      />

      {!hydrated ? (
        <div className="space-y-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-white border border-ink-100 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
      {/* Süresi yaklaşan */}
      <Section
        title="Süresi yaklaşan iadeler"
        icon={<Calendar className="h-4 w-4 text-warn-500" />}
        emptyText="Yakın zamanda iade süresi dolan ürün yok."
      >
        {upcoming.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warn-50 text-warn-600 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900 truncate">{p.name}</p>
                <p className="text-xs text-ink-500 mt-0.5">
                  {p.brand} · {p.store} · {formatCurrencyTRY(p.price)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge tone="warn">{humanizeDaysLeft(p.returnDeadline)}</Badge>
                  <span className="text-xs text-ink-500">
                    Son tarih: {formatDateTR(p.returnDeadline)}
                  </span>
                </div>
              </div>
              <Link href={`/app/products/${p.id}`} className="shrink-0">
                <Button size="sm" className="gap-1.5">
                  İade başlat
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </Section>

      {/* Devam eden */}
      <Section
        title="Devam eden iade süreçleri"
        icon={<RotateCcw className="h-4 w-4 text-brand-700" />}
        emptyText="Şu an açık iade sürecin yok."
      >
        {inProgress.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 shrink-0">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink-900 truncate">{p.name}</p>
                  {p.returnProcess && <ReturnStatusBadge status={p.returnProcess.status} />}
                </div>
                <p className="text-xs text-ink-500 mt-0.5">
                  {p.brand} · {p.store}
                </p>
                {p.returnProcess && (
                  <div className="mt-2 grid sm:grid-cols-3 gap-y-1 gap-x-4 text-xs text-ink-600">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateTR(p.returnProcess.requestDate)}
                    </span>
                    {p.returnProcess.shippingCompany && (
                      <span className="inline-flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" />
                        {p.returnProcess.shippingCompany}
                        {p.returnProcess.trackingNumber ? ` · ${p.returnProcess.trackingNumber}` : ""}
                      </span>
                    )}
                  </div>
                )}
                {p.returnProcess?.reason && (
                  <p className="text-sm text-ink-700 mt-2 line-clamp-2">
                    “{p.returnProcess.reason}”
                  </p>
                )}
              </div>
              <Link href={`/app/products/${p.id}`} className="shrink-0">
                <Button variant="outline" size="sm">
                  Yönet
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </Section>

      {/* Tamamlanan */}
      {completed.length > 0 && (
        <Section
          title="Tamamlanan iadeler"
          icon={<Package className="h-4 w-4 text-accent-700" />}
        >
          {completed.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-700 shrink-0">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate">{p.name}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{p.brand} · İade tamamlandı</p>
                </div>
                <Link
                  href={`/app/products/${p.id}`}
                  className="text-sm font-medium text-brand-700 hover:text-brand-800"
                >
                  Görüntüle
                </Link>
              </CardContent>
            </Card>
          ))}
        </Section>
      )}

      {upcoming.length === 0 && inProgress.length === 0 && completed.length === 0 && (
        <EmptyState
          icon={<RotateCcw className="h-6 w-6" />}
          title="Henüz iade süreci yok"
          description="Bir ürünün detay sayfasında iade süreci başlatabilirsin."
          action={
            <Link href="/app/products">
              <Button>Ürünlere git</Button>
            </Link>
          }
        />
      )}
        </>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  children,
  emptyText,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  emptyText?: string;
}) {
  const arr = Array.isArray(children) ? children : [children];
  const empty = arr.length === 0;
  if (empty && !emptyText) return null;
  return (
    <section className="mb-8">
      <h2 className="text-base font-semibold text-ink-900 flex items-center gap-2 mb-3">
        {icon} {title}
      </h2>
      {empty ? (
        <p className="text-sm text-ink-500 rounded-2xl bg-white border border-ink-100 p-5">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </section>
  );
}
