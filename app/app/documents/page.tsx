"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Search, Filter, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { useAldimStore } from "@/lib/store";
import { formatDateTR } from "@/lib/utils";
import { DOCUMENT_TYPE_LABEL } from "@/lib/status";
import type { DocumentType } from "@/lib/types";

export default function DocumentsPage() {
  const { products, hydrated } = useAldimStore();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<DocumentType | "all">("all");

  const docs = useMemo(() => {
    const all = products.flatMap((p) =>
      p.documents.map((d) => ({ ...d, productName: p.name, productBrand: p.brand })),
    );
    return all
      .filter((d) => (type === "all" ? true : d.type === type))
      .filter((d) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.productName.toLowerCase().includes(q) ||
          d.productBrand.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [products, type, query]);

  return (
    <div>
      <PageHeader
        title="Belge kasası"
        description="Tüm faturalarını, garanti belgelerini ve servis formlarını tek yerden gör."
        actions={
          <Link href="/app/products">
            <Button variant="outline">Ürünlere git</Button>
          </Link>
        }
      />

      <div className="grid sm:grid-cols-[1fr_auto] gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Belge veya ürün ara"
            className="pl-10"
          />
        </div>
        <div className="relative sm:w-56">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none z-10" />
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as DocumentType | "all")}
            className="pl-10"
          >
            <option value="all">Tüm belge tipleri</option>
            {Object.entries(DOCUMENT_TYPE_LABEL).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {!hydrated ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-white border border-ink-100 animate-pulse"
            />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="Henüz belge yok"
          description="Ürün detayında belge ekleyerek belge kasanı oluşturmaya başlayabilirsin."
          action={
            <Link href="/app/products">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Bir ürüne belge ekle
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {docs.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-5 flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900 truncate">{d.name}</p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    {d.productBrand} · {d.productName}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge tone="info">{DOCUMENT_TYPE_LABEL[d.type]}</Badge>
                    <span className="text-xs text-ink-500">{formatDateTR(d.date)}</span>
                  </div>
                </div>
                <Link
                  href={`/app/products/${d.productId}`}
                  className="text-sm font-medium text-brand-700 hover:text-brand-800 shrink-0"
                >
                  Görüntüle
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
