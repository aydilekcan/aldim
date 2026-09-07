"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, ChevronDown, FileUp, Layers } from "lucide-react";
import { CATEGORIES, type FieldSpec } from "@/shared/categories";
import { parseAmount } from "@/shared/domain";
import type { AldimItem, ItemCategory, ItemFieldValue } from "@/shared/types";
import { useAldimStore } from "@/lib/store";
import { PageHeading } from "./workspace";
export function ItemEditor({
  id,
  initialCategory,
}: {
  id?: string;
  initialCategory?: string;
}) {
  const store = useAldimStore();
  const existing = store.items.find((i) => i.id === id);
  const router = useRouter();
  const [category, setCategory] = useState<ItemCategory | undefined>(
    existing?.category ??
      (initialCategory && initialCategory in CATEGORIES
        ? (initialCategory as ItemCategory)
        : undefined),
  );
  const [values, setValues] = useState<Record<string, ItemFieldValue>>(
    existing
      ? {
          ...existing.fields,
          title: existing.title,
          brand: existing.brand,
          model: existing.model,
          store: existing.store,
          price: existing.price,
          purchaseDate: existing.purchaseDate,
          notes: existing.notes,
        }
      : {},
  );
  const [details, setDetails] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  if (id && !existing)
    return (
      <p>
        Kayıt bulunamadı. <Link href="/app/items">Kayıtlarıma dön</Link>
      </p>
    );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !store.user || saving) return;
    setSaving(true);
    setError("");
    let createdId: string | undefined;
    try {
      const fields: Record<string, ItemFieldValue> = {};
      const top: Record<string, ItemFieldValue> = {};
      for (const spec of CATEGORIES[category].fields) {
        let val = values[spec.key];
        if (spec.required && (val === undefined || val === ""))
          throw new Error(`${spec.label} gerekli.`);
        if (spec.type === "currency" && val !== undefined && val !== "")
          val = typeof val === "number" ? val : parseAmount(String(val));
        else if (spec.type === "number" && val !== undefined && val !== "") {
          val = Number(val);
          if (!Number.isFinite(val) || val < 0)
            throw new Error(`${spec.label} geçerli bir sayı olmalı.`);
        }
        (spec.topLevel ? top : fields)[spec.key] = val === "" ? undefined : val;
      }
      const now = new Date().toISOString();
      const item: AldimItem = {
        id: existing?.id ?? crypto.randomUUID(),
        userId: store.user.id,
        category,
        title: String(top.title ?? "").trim(),
        brand: top.brand as string | undefined,
        model: top.model as string | undefined,
        store: top.store as string | undefined,
        price: top.price as number | undefined,
        purchaseDate: top.purchaseDate as string | undefined,
        notes: top.notes as string | undefined,
        status: existing?.status ?? "active",
        fields,
        documents: existing?.documents ?? [],
        serviceRecords: existing?.serviceRecords ?? [],
        createdAt: existing?.createdAt ?? now,
        updatedAt: existing?.updatedAt ?? now,
      };
      await store.saveItem(item);
      createdId = item.id;
      if (file)
        await store.upload(
          item,
          file,
          category === "home_bill" ? "bill" : "invoice",
        );
      router.push(`/app/items/${item.id}`);
    } catch (e) {
      if (createdId) {
        setError(
          `Kayıt kaydedildi; belge yüklenemedi: ${(e as Error).message}. Belgeyi kayıt detayından tekrar ekleyebilirsin.`,
        );
        router.push(`/app/items/${createdId}?uploadFailed=1`);
      } else setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  const renderField = (spec: FieldSpec) => {
    const val = values[spec.key];
    const set = (value: ItemFieldValue) =>
      setValues((v) => ({ ...v, [spec.key]: value }));
    return (
      <label
        key={spec.key}
        className={
          spec.type === "textarea"
            ? "full-span"
            : spec.type === "boolean"
              ? "checkbox-label"
              : ""
        }
      >
        {spec.type === "boolean" ? (
          <>
            <input
              type="checkbox"
              checked={val === true}
              onChange={(e) => set(e.target.checked)}
            />
            {spec.label}
          </>
        ) : (
          <>
            {spec.label}
            {spec.required && <span className="required"> *</span>}
            {spec.type === "select" ? (
              <select
                value={String(val ?? "")}
                onChange={(e) => set(e.target.value)}
              >
                <option value="">Seç</option>
                {spec.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : spec.type === "textarea" ? (
              <textarea
                value={String(val ?? "")}
                onChange={(e) => set(e.target.value)}
                rows={3}
              />
            ) : (
              <input
                value={String(val ?? "")}
                onChange={(e) => set(e.target.value)}
                type={
                  spec.type === "date"
                    ? "date"
                    : spec.type === "number"
                      ? "number"
                      : "text"
                }
                inputMode={spec.type === "currency" ? "decimal" : undefined}
                required={spec.required}
                placeholder={
                  spec.placeholder ??
                  (spec.type === "currency" ? "0,00" : undefined)
                }
                min={spec.type === "number" ? 0 : undefined}
              />
            )}{" "}
            {spec.hint && <small>{spec.hint}</small>}
          </>
        )}
      </label>
    );
  };
  return (
    <div className="editor-wrap">
      <Link
        className="back-link"
        href={existing ? `/app/items/${existing.id}` : "/app/items"}
      >
        <ArrowLeft size={17} /> {existing ? "Kayda dön" : "Kayıtlarıma dön"}
      </Link>
      <PageHeading
        eyebrow={existing ? "HER ŞEY GÜNCEL KALSIN" : "BİRAZ DÜZENLE BAŞLA"}
        title={existing ? "Kaydı düzenle" : "Ne eklemek istersin?"}
        description={
          category
            ? `${CATEGORIES[category].label} · Temel bilgileri gir; detayları dilediğin zaman ekleyebilirsin.`
            : "Bir kategori seç. Sana sadece gerekli alanları gösterelim."
        }
      />
      {!category ? (
        <div className="category-grid">
          {Object.values(CATEGORIES).map((c) => (
            <button
              className="category-card"
              key={c.category}
              onClick={() => setCategory(c.category)}
            >
              <div className="item-icon">
                <Layers size={23} />
              </div>
              <strong>{c.label}</strong>
              <span>{c.examples}</span>
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={submit} className="panel editor-panel">
          {!existing && (
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setCategory(undefined);
                setValues({});
              }}
            >
              ← Kategoriyi değiştir
            </button>
          )}
          <div className="form-grid">
            {CATEGORIES[category].fields
              .filter((f) => f.essential !== false)
              .map(renderField)}
          </div>
          <button
            type="button"
            className="details-toggle"
            onClick={() => setDetails(!details)}
          >
            <ChevronDown size={17} />
            {details ? "Detayları gizle" : "Daha fazla bilgi ekle"}
            <span>İsteğe bağlı</span>
          </button>
          {details && (
            <div className="form-grid">
              {CATEGORIES[category].fields
                .filter((f) => f.essential === false)
                .map(renderField)}
            </div>
          )}
          <label className="upload-box">
            <FileUp size={28} />
            <strong>{file ? file.name : "Faturanı da ekle"}</strong>
            <span>Fotoğraf veya PDF · En fazla 6 MB · İsteğe bağlı</span>
            <input
              aria-label="Fatura dosyası"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions">
            <Link className="secondary" href="/app/items">
              Vazgeç
            </Link>
            <button className="primary" disabled={saving}>
              <Check size={18} />
              {saving
                ? "Kaydediliyor…"
                : existing
                  ? "Değişiklikleri kaydet"
                  : CATEGORIES[category].submitLabel}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
