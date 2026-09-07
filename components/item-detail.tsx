"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Archive,
  FilePlus2,
  Pencil,
  Wrench,
  Trash2,
  Check,
} from "lucide-react";
import { useAldimStore } from "@/lib/store";
import { CATEGORIES } from "@/shared/categories";
import { DOCUMENT_LABELS, itemAmount } from "@/shared/domain";
import { formatCurrencyTRY, formatDateTR, todayIso } from "@/shared/date-utils";
import type { DocumentType, ServiceRecord } from "@/shared/types";
import { PageHeading, Empty, ReminderLine, DocumentActions } from "./workspace";
export function ItemDetail({ id }: { id: string }) {
  const store = useAldimStore();
  const item = store.items.find((i) => i.id === id);
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState(
    params.has("uploadFailed")
      ? "Kayıt kaydedildi ancak belge yüklenemedi. Aşağıdan tekrar ekleyebilirsin."
      : "",
  );
  const [service, setService] = useState(false);
  const [type, setType] = useState<DocumentType>("invoice");
  if (!item)
    return (
      <Empty
        title="Kayıt bulunamadı."
        description="Bu kayıt silinmiş veya başka bir hesaba ait olabilir."
        href="/app/items"
        label="Kayıtlara dön"
      />
    );
  const current = item;
  const spec = CATEGORIES[item.category];
  const reminders = store.reminders.filter((r) => r.itemId === id);
  async function run(action: () => Promise<unknown>) {
    setError("");
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function saveService(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const record: ServiceRecord = {
      id: crypto.randomUUID(),
      itemId: id,
      date: String(form.get("date")),
      company: String(form.get("company")).trim(),
      description: String(form.get("description")).trim(),
      status: "open",
      nextFollowUpDate: String(form.get("followup")) || undefined,
    };
    await run(async () => {
      await store.saveItem({
        ...current,
        serviceRecords: [...current.serviceRecords, record],
      });
      setService(false);
    });
  }
  return (
    <>
      <Link className="back-link" href="/app/items">
        <ArrowLeft size={17} /> Kayıtlarıma dön
      </Link>
      <PageHeading
        eyebrow={spec.label.toLocaleUpperCase("tr")}
        title={item.title}
        description={
          [item.brand, item.model, item.store].filter(Boolean).join(" · ") ||
          "Belgelerin, tarihler ve servis geçmişin tek bir kayıtta."
        }
        action={
          <Link className="secondary" href={`/app/items/${id}/edit`}>
            <Pencil size={17} /> Düzenle
          </Link>
        }
      />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="detail-grid">
        <div>
          <section className="panel detail-panel">
            <h2>Kayıt bilgileri</h2>
            <dl className="detail-fields">
              <div>
                <dt>Tutar</dt>
                <dd>{formatCurrencyTRY(itemAmount(item))}</dd>
              </div>
              <div>
                <dt>Durum</dt>
                <dd>{item.status === "active" ? "Aktif" : "Arşivde"}</dd>
              </div>
              {spec.fields
                .filter(
                  (f) =>
                    ![
                      "title",
                      "notes",
                      "price",
                      "monthlyAmount",
                      "amount",
                    ].includes(f.key),
                )
                .map((f) => {
                  const val = f.topLevel
                    ? (item as unknown as Record<string, unknown>)[f.key]
                    : item.fields[f.key];
                  return val !== undefined && val !== "" ? (
                    <div key={f.key}>
                      <dt>{f.label}</dt>
                      <dd>
                        {f.type === "date"
                          ? formatDateTR(String(val))
                          : f.type === "boolean"
                            ? val
                              ? "Evet"
                              : "Hayır"
                            : (f.options?.find((o) => o.value === val)?.label ??
                              String(val))}
                      </dd>
                    </div>
                  ) : null;
                })}
            </dl>
            {item.notes && (
              <div className="notes">
                <strong>Notların</strong>
                <p>{item.notes}</p>
              </div>
            )}
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>
                <Wrench size={19} /> Servis geçmişi
              </h2>
              <button
                className="text-button"
                onClick={() => setService(!service)}
              >
                + Servis kaydı
              </button>
            </div>
            {service && (
              <form className="inline-form" onSubmit={saveService}>
                <div className="form-grid">
                  <label>
                    Servis / firma
                    <input name="company" required />
                  </label>
                  <label>
                    Servis tarihi
                    <input
                      type="date"
                      name="date"
                      defaultValue={todayIso()}
                      required
                    />
                  </label>
                  <label className="full-span">
                    Yapılan işlem / sorun
                    <textarea name="description" required />
                  </label>
                  <label>
                    Takip tarihi
                    <input type="date" name="followup" />
                  </label>
                </div>
                <button className="primary small" disabled={store.busy}>
                  Servis kaydını ekle
                </button>
              </form>
            )}
            {item.serviceRecords.length
              ? item.serviceRecords.map((record) => (
                  <div key={record.id} className="service-record">
                    <div className="section-heading">
                      <strong>{record.company}</strong>
                      <span className="pill neutral">
                        {record.status === "resolved"
                          ? "Tamamlandı"
                          : "Devam ediyor"}
                      </span>
                    </div>
                    <p>{record.description}</p>
                    <small>
                      {formatDateTR(record.date)}
                      {record.nextFollowUpDate
                        ? ` · Takip: ${formatDateTR(record.nextFollowUpDate)}`
                        : ""}
                    </small>
                    {record.status !== "resolved" && (
                      <button
                        className="text-button"
                        disabled={store.busy}
                        onClick={() =>
                          void run(() =>
                            store.saveItem({
                              ...current,
                              serviceRecords: current.serviceRecords.map((r) =>
                                r.id === record.id
                                  ? { ...r, status: "resolved" }
                                  : r,
                              ),
                            }),
                          )
                        }
                      >
                        <Check size={15} /> Servis tamamlandı
                      </button>
                    )}
                  </div>
                ))
              : !service && (
                  <Empty
                    title="Servis geçmişi tertemiz."
                    description="Bakım veya onarım gerektiğinde servis kaydını buraya ekle."
                  />
                )}
          </section>
        </div>
        <div>
          <section className="panel">
            <div className="panel-heading">
              <h2>
                Belgeler <span className="count">{item.documents.length}</span>
              </h2>
            </div>
            <div className="inline-form">
              <select
                aria-label="Yüklenecek belge türü"
                value={type}
                onChange={(e) => setType(e.target.value as DocumentType)}
              >
                {Object.entries(DOCUMENT_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <label className="upload-box compact">
                <FilePlus2 size={23} />
                <strong>
                  {store.busy ? "Yükleniyor…" : "Fotoğraf veya PDF ekle"}
                </strong>
                <span>En fazla 6 MB</span>
                <input
                  disabled={store.busy}
                  aria-label="Belge yükle"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void run(() => store.upload(current, file, type));
                    e.target.value = "";
                  }}
                />
              </label>
              <label className="text-button">
                Telefon kamerasıyla çek
                <input
                  className="camera-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  disabled={store.busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void run(() => store.upload(current, file, type));
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            {item.documents.map((doc) => (
              <div key={doc.id} className="record-row">
                <div className="row-main">
                  <strong>{doc.name}</strong>
                  <span>{DOCUMENT_LABELS[doc.type]}</span>
                </div>
                <DocumentActions doc={doc} />
              </div>
            ))}
          </section>
          <section className="panel">
            <div className="panel-heading">
              <h2>Önemli tarihler</h2>
            </div>
            {reminders.length ? (
              reminders.map((r) => <ReminderLine key={r.id} reminder={r} />)
            ) : (
              <Empty
                title="Tarih eklenmemiş."
                description="Düzenle butonundan garanti veya ödeme tarihini ekleyebilirsin."
              />
            )}
          </section>
        </div>
      </div>
      <div className="danger-actions">
        <button
          className="secondary"
          disabled={store.busy}
          onClick={() =>
            void run(() =>
              store.saveItem({
                ...current,
                status: current.status === "active" ? "archived" : "active",
              }),
            )
          }
        >
          <Archive size={17} />
          {item.status === "active" ? "Kaydı arşivle" : "Arşivden çıkar"}
        </button>
        <button
          className="text-button danger-text"
          disabled={store.busy}
          onClick={() => {
            if (
              confirm(
                "Kayıt ve bağlı belgeler arşivinden kaldırılacak. Devam edilsin mi?",
              )
            )
              void run(async () => {
                await store.deleteItem(id);
                router.push("/app/items");
              });
          }}
        >
          <Trash2 size={16} /> Kaydı sil
        </button>
      </div>
    </>
  );
}
