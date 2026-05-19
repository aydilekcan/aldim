"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Package,
  ShieldCheck,
  RotateCcw,
  Wrench,
  Plus,
  Receipt,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { QuickActionCard } from "@/components/quick-action-card";
import { AlertBanner } from "@/components/alert-banner";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useAldimStore } from "@/lib/store";
import { daysUntil, humanizeDaysLeft } from "@/lib/date-utils";
import { riskLevel } from "@/lib/status";

interface DashboardAlert {
  id: string;
  productId: string;
  title: string;
  description?: string;
  tone: "warn" | "danger" | "info";
  icon: React.ReactNode;
}

export default function DashboardPage() {
  const { products, settings, hydrated } = useAldimStore();

  const stats = useMemo(() => {
    const total = products.length;
    const warrantyExpiring = products.filter((p) => {
      const d = daysUntil(p.warrantyEndDate);
      return d >= 0 && d <= settings.warrantyWarnDays;
    }).length;
    const returnSoon = products.filter((p) => {
      const d = daysUntil(p.returnDeadline);
      return d >= 0 && d <= settings.returnWarnDays && !p.returnProcess;
    }).length;
    const inService = products.filter((p) =>
      p.serviceRecords.some((s) => s.status !== "resolved"),
    ).length;
    return { total, warrantyExpiring, returnSoon, inService };
  }, [products, settings]);

  const alerts: DashboardAlert[] = useMemo(() => {
    const arr: DashboardAlert[] = [];
    for (const p of products) {
      const returnLeft = daysUntil(p.returnDeadline);
      const warrantyLeft = daysUntil(p.warrantyEndDate);
      if (
        returnLeft >= 0 &&
        returnLeft <= settings.returnWarnDays &&
        !p.returnProcess
      ) {
        arr.push({
          id: `r_${p.id}`,
          productId: p.id,
          title: `${p.name} için iade süresi ${humanizeDaysLeft(p.returnDeadline).toLowerCase()}.`,
          description: "İade kararını verip mesajını şimdi gönderebilirsin.",
          tone: returnLeft <= 2 ? "danger" : "warn",
          icon: <RotateCcw className="h-4 w-4" />,
        });
      }
      if (warrantyLeft >= 0 && warrantyLeft <= settings.warrantyWarnDays) {
        arr.push({
          id: `w_${p.id}`,
          productId: p.id,
          title: `${p.name} garantisi ${humanizeDaysLeft(p.warrantyEndDate).toLowerCase()}.`,
          description: "Garanti hakkını kullanmak için süre bitmeden başvurmayı düşün.",
          tone: warrantyLeft <= 7 ? "danger" : "warn",
          icon: <ShieldCheck className="h-4 w-4" />,
        });
      }
      const openService = p.serviceRecords.find((s) => s.status !== "resolved");
      if (openService) {
        arr.push({
          id: `s_${p.id}`,
          productId: p.id,
          title: `${p.name} için açık bir servis kaydın var.`,
          description: `${openService.company} — durum güncellemesi bekleniyor.`,
          tone: "info",
          icon: <Wrench className="h-4 w-4" />,
        });
      }
    }
    // Tehlike öncelikli sırala
    const order = { danger: 0, warn: 1, info: 2 } as const;
    return arr.sort((a, b) => order[a.tone] - order[b.tone]).slice(0, 5);
  }, [products, settings]);

  // Riske göre öne çıkarılmış ürün listesi (yüksek riskli üstte).
  const sortedProducts = useMemo(() => {
    const order = { high: 0, medium: 1, low: 2 } as const;
    return [...products].sort((a, b) => order[riskLevel(a)] - order[riskLevel(b)]);
  }, [products]);

  return (
    <div>
      <PageHeader
        title="Aldıkların kontrol altında"
        description="Fatura, garanti ve iade süreçlerini tek yerden takip et."
        actions={
          <>
            <Link href="/app/products" className="hidden sm:inline-flex">
              <Button variant="outline" size="md">
                Tüm ürünler
              </Button>
            </Link>
            <Link href="/app/products/new" className="hidden sm:inline-flex">
              <Button size="md" className="gap-2">
                <Plus className="h-4 w-4" />
                Ürün ekle
              </Button>
            </Link>
          </>
        }
      />

      {/* Quick actions */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <QuickActionCard
          href="/app/products/new"
          icon={<Plus className="h-5 w-5" />}
          title="Ürün ekle"
          description="Yeni bir alışverişi sisteme tanıt."
        />
        <QuickActionCard
          href="/app/documents"
          icon={<Receipt className="h-5 w-5" />}
          title="Belgeleri gör"
          description="Tüm fatura ve belgelerine ulaş."
        />
        <QuickActionCard
          href="/app/returns"
          icon={<RotateCcw className="h-5 w-5" />}
          title="İade takip"
          description="Devam eden iadelerini yönet."
        />
        <QuickActionCard
          href="/app/products"
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Garanti kontrol"
          description="Süresi yaklaşan ürünlere odaklan."
        />
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Toplam ürün"
          value={stats.total}
          icon={<Package className="h-5 w-5" />}
          tone="info"
        />
        <StatCard
          label="Garanti bitmek üzere"
          value={stats.warrantyExpiring}
          icon={<ShieldCheck className="h-5 w-5" />}
          tone={stats.warrantyExpiring > 0 ? "warn" : "neutral"}
          hint={`Eşik: ${settings.warrantyWarnDays} gün`}
        />
        <StatCard
          label="İade süresi yaklaşan"
          value={stats.returnSoon}
          icon={<RotateCcw className="h-5 w-5" />}
          tone={stats.returnSoon > 0 ? "danger" : "neutral"}
          hint={`Eşik: ${settings.returnWarnDays} gün`}
        />
        <StatCard
          label="Serviste"
          value={stats.inService}
          icon={<Wrench className="h-5 w-5" />}
          tone={stats.inService > 0 ? "info" : "neutral"}
        />
      </section>

      {/* Alerts */}
      {hydrated && alerts.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-ink-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warn-500" />
              Acil uyarılar
            </h2>
            <span className="text-xs text-ink-500">{alerts.length} öğe</span>
          </div>
          <div className="space-y-2">
            {alerts.map((a) => (
              <Link key={a.id} href={`/app/products/${a.productId}`} className="block">
                <AlertBanner
                  tone={a.tone}
                  icon={a.icon}
                  title={a.title}
                  description={a.description}
                  action={
                    <span className="hidden sm:inline-flex items-center text-xs font-medium">
                      Aç <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                    </span>
                  }
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-ink-900 flex items-center gap-2">
            <Package className="h-4 w-4 text-brand-700" />
            Son ürünlerin
          </h2>
          <Link
            href="/app/products"
            className="text-sm font-medium text-brand-700 hover:text-brand-800 inline-flex items-center"
          >
            Tümü
            <ArrowRight className="h-4 w-4 ml-0.5" />
          </Link>
        </div>

        {!hydrated ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-white border border-ink-100 animate-pulse"
              />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <EmptyState
            icon={<Package className="h-6 w-6" />}
            title="Henüz ürün eklemedin"
            description="İlk alışverişini Aldım'a tanıt — fatura, garanti ve iade tarihlerini tek yerden takip etmeye başla."
            action={
              <Link href="/app/products/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  İlk ürünü ekle
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortedProducts.slice(0, 6).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                warrantyWarnDays={settings.warrantyWarnDays}
                returnWarnDays={settings.returnWarnDays}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
