"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label, FieldError, FieldHint } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAldimStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { addDaysIso, addMonthsIso, todayIso } from "@/lib/date-utils";
import {
  CATEGORY_SUGGESTIONS,
  STORE_SUGGESTIONS,
} from "@/lib/mock-data";

interface FormState {
  name: string;
  brand: string;
  category: string;
  store: string;
  purchaseDate: string;
  price: string;
  invoiceNumber: string;
  warrantyMonths: string;
  returnDays: string;
  trackingNumber: string;
  notes: string;
}

const DEFAULT_FORM: FormState = {
  name: "",
  brand: "",
  category: CATEGORY_SUGGESTIONS[0],
  store: STORE_SUGGESTIONS[0],
  purchaseDate: todayIso(),
  price: "",
  invoiceNumber: "",
  warrantyMonths: "24",
  returnDays: "14",
  trackingNumber: "",
  notes: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (!form.name.trim()) errors.name = "Ürün adı gerekli";
  if (!form.brand.trim()) errors.brand = "Marka gerekli";
  if (!form.purchaseDate) errors.purchaseDate = "Satın alma tarihi gerekli";
  const priceNum = Number(form.price);
  if (form.price === "" || Number.isNaN(priceNum) || priceNum < 0) {
    errors.price = "Geçerli bir fiyat gir";
  }
  const wm = Number(form.warrantyMonths);
  if (Number.isNaN(wm) || wm < 0) errors.warrantyMonths = "Geçerli bir süre gir";
  const rd = Number(form.returnDays);
  if (Number.isNaN(rd) || rd < 0) errors.returnDays = "Geçerli bir süre gir";
  return errors;
}

export default function NewProductPage() {
  const router = useRouter();
  const { addProduct } = useAldimStore();
  const { success, danger } = useToast();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Errors>({});

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) {
      danger("Lütfen eksik alanları doldur.");
      return;
    }

    const warrantyMonths = Number(form.warrantyMonths) || 0;
    const returnDays = Number(form.returnDays) || 0;

    const created = addProduct({
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      store: form.store,
      price: Number(form.price),
      purchaseDate: form.purchaseDate,
      warrantyEndDate: addMonthsIso(form.purchaseDate, warrantyMonths),
      returnDeadline: addDaysIso(form.purchaseDate, returnDays),
      invoiceNumber: form.invoiceNumber.trim() || undefined,
      trackingNumber: form.trackingNumber.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });

    success(`${created.name} Aldım'a eklendi.`);
    router.push(`/app/products/${created.id}`);
  };

  return (
    <div className="max-w-3xl">
      <Link
        href="/app/products"
        className="hidden md:inline-flex items-center text-sm text-ink-600 hover:text-ink-900 gap-1 mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Ürünlere dön
      </Link>
      <PageHeader
        title="Yeni ürün ekle"
        description="Marka, fiyat, garanti ve iade süresini gir. İstediğin zaman düzenleyebilirsin."
      />

      <form onSubmit={onSubmit} className="space-y-5 pb-28 sm:pb-0">
        <Card>
          <CardHeader>
            <CardTitle>Ürün bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Ürün adı</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Örn. MacBook Air M2"
                autoFocus
              />
              <FieldError message={errors.name} />
            </div>
            <div>
              <Label htmlFor="brand">Marka</Label>
              <Input
                id="brand"
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
                placeholder="Örn. Apple"
              />
              <FieldError message={errors.brand} />
            </div>
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select
                id="category"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Satın alma bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="store">Satın alınan yer</Label>
              <Select
                id="store"
                value={form.store}
                onChange={(e) => update("store", e.target.value)}
              >
                {STORE_SUGGESTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="purchaseDate">Satın alma tarihi</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={form.purchaseDate}
                onChange={(e) => update("purchaseDate", e.target.value)}
              />
              <FieldError message={errors.purchaseDate} />
            </div>
            <div>
              <Label htmlFor="price">Fiyat (₺)</Label>
              <Input
                id="price"
                type="number"
                inputMode="decimal"
                min={0}
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="Örn. 8999"
              />
              <FieldError message={errors.price} />
            </div>
            <div>
              <Label htmlFor="invoiceNumber">Fatura numarası</Label>
              <Input
                id="invoiceNumber"
                value={form.invoiceNumber}
                onChange={(e) => update("invoiceNumber", e.target.value)}
                placeholder="Opsiyonel"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Garanti & iade</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="warrantyMonths">Garanti süresi (ay)</Label>
              <Input
                id="warrantyMonths"
                type="number"
                inputMode="numeric"
                min={0}
                value={form.warrantyMonths}
                onChange={(e) => update("warrantyMonths", e.target.value)}
              />
              <FieldHint>Yaygın değerler: 12, 24, 36 ay.</FieldHint>
              <FieldError message={errors.warrantyMonths} />
            </div>
            <div>
              <Label htmlFor="returnDays">İade süresi (gün)</Label>
              <Input
                id="returnDays"
                type="number"
                inputMode="numeric"
                min={0}
                value={form.returnDays}
                onChange={(e) => update("returnDays", e.target.value)}
              />
              <FieldHint>Mesafeli satışta yaygın olarak 14 gün.</FieldHint>
              <FieldError message={errors.returnDays} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="trackingNumber">Kargo takip no</Label>
              <Input
                id="trackingNumber"
                value={form.trackingNumber}
                onChange={(e) => update("trackingNumber", e.target.value)}
                placeholder="Opsiyonel"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notlar</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="notes">Not</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Renk, beden, hediyelik vb. ek bilgiler."
            />
          </CardContent>
        </Card>

        {/* Desktop: in-flow */}
        <div className="hidden sm:flex justify-end gap-2">
          <Link href="/app/products">
            <Button type="button" variant="ghost">
              Vazgeç
            </Button>
          </Link>
          <Button type="submit" className="gap-2">
            <Check className="h-4 w-4" />
            Ürünü kaydet
          </Button>
        </div>

        {/* Mobile: fixed bottom action bar — bottom-nav üstüne otur */}
        <div
          className="sm:hidden fixed inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-ink-100"
          style={{ bottom: "var(--bottom-nav-h)" }}
        >
          <div className="flex gap-2 px-4 py-3">
            <Link href="/app/products" className="flex-1">
              <Button type="button" variant="ghost" className="w-full">
                Vazgeç
              </Button>
            </Link>
            <Button type="submit" className="flex-[2] gap-2">
              <Check className="h-4 w-4" />
              Kaydet
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
