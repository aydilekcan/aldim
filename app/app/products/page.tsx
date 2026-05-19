"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Package, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAldimStore } from "@/lib/store";
import { daysUntil } from "@/lib/date-utils";

type Filter =
  | "all"
  | "warranty_expiring"
  | "return_soon"
  | "in_service"
  | "return_in_progress";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "warranty_expiring", label: "Garanti bitmek üzere" },
  { id: "return_soon", label: "İade süresi yaklaşan" },
  { id: "in_service", label: "Serviste" },
  { id: "return_in_progress", label: "İade sürecinde" },
];

export default function ProductsPage() {
  const { products, settings, hydrated } = useAldimStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      // Filtre
      if (filter === "warranty_expiring") {
        const d = daysUntil(p.warrantyEndDate);
        if (d < 0 || d > settings.warrantyWarnDays) return false;
      }
      if (filter === "return_soon") {
        const d = daysUntil(p.returnDeadline);
        if (d < 0 || d > settings.returnWarnDays || p.returnProcess) return false;
      }
      if (filter === "in_service") {
        if (!p.serviceRecords.some((s) => s.status !== "resolved")) return false;
      }
      if (filter === "return_in_progress") {
        if (!p.returnProcess || p.returnProcess.status === "completed") return false;
      }
      // Arama
      if (query.trim()) {
        const q = query.toLowerCase();
        const haystack = `${p.name} ${p.brand} ${p.category} ${p.store}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [products, filter, query, settings]);

  return (
    <div>
      <PageHeader
        title="Ürünlerin"
        description="Tüm alışverişlerini, garanti ve iade durumlarını burada gör."
        actions={
          <Link href="/app/products/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Ürün ekle
            </Button>
          </Link>
        }
      />

      {/* Search + filters */}
      <div className="mb-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ürün, marka, mağaza ara"
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "shrink-0 px-3.5 h-9 rounded-full text-sm font-medium border transition",
                filter === f.id
                  ? "bg-brand-700 text-white border-brand-700"
                  : "bg-white text-ink-700 border-ink-200 hover:border-ink-300",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
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
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title={query || filter !== "all" ? "Eşleşen ürün bulunamadı" : "Henüz ürün eklemedin"}
          description={
            query || filter !== "all"
              ? "Filtreyi temizleyip tekrar deneyebilirsin."
              : "İlk alışverişini Aldım'a tanıt — kontrolü ele al."
          }
          action={
            <Link href="/app/products/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> İlk ürünü ekle
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              warrantyWarnDays={settings.warrantyWarnDays}
              returnWarnDays={settings.returnWarnDays}
            />
          ))}
        </div>
      )}
    </div>
  );
}
