"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ShieldCheck,
  RotateCcw,
  Wrench,
  FileText,
  Plus,
  Copy,
  Check,
  Receipt,
  Truck,
  Pencil,
  Trash2,
  StickyNote,
  Send,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ProductStatusBadge,
  ReturnStatusBadge,
  WarrantyStatusBadge,
} from "@/components/status-badge";
import { AlertBanner } from "@/components/alert-banner";
import { EmptyState } from "@/components/empty-state";
import { useAldimStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { daysUntil, humanizeDaysLeft, todayIso } from "@/lib/date-utils";
import {
  DOCUMENT_TYPE_LABEL,
  PRODUCT_STATUS_LABEL,
  RETURN_STATUS_LABEL,
  SERVICE_STATUS_LABEL,
  returnStatus,
  warrantyStatus,
} from "@/lib/status";
import { sellerReturnMessage } from "@/lib/templates";
import type {
  DocumentType,
  ReturnStatus,
  ServiceRecord,
} from "@/lib/types";
import { cn, formatCurrencyTRY, formatDateTR } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const {
    products,
    settings,
    hydrated,
    updateProduct,
    deleteProduct,
    addDocument,
    addServiceRecord,
    startReturn,
    updateReturn,
  } = useAldimStore();
  const { success, info, danger } = useToast();

  const product = useMemo(
    () => products.find((p) => p.id === params.id),
    [products, params.id],
  );

  const [showReturn, setShowReturn] = useState(false);
  const [showService, setShowService] = useState(false);
  const [showDoc, setShowDoc] = useState(false);
  const [editNote, setEditNote] = useState(false);
  const [notesDraft, setNotesDraft] = useState(product?.notes ?? "");
  const [copied, setCopied] = useState(false);

  if (!hydrated) {
    return (
      <div className="space-y-3" aria-hidden>
        <div className="h-8 w-2/3 rounded-lg bg-white border border-ink-100 animate-pulse" />
        <div className="h-32 rounded-2xl bg-white border border-ink-100 animate-pulse" />
        <div className="h-64 rounded-2xl bg-white border border-ink-100 animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <EmptyState
        title="Ürün bulunamadı"
        description="Aradığın ürün silinmiş ya da bağlantı hatalı olabilir."
        action={
          <Link href="/app/products">
            <Button>Ürünlere dön</Button>
          </Link>
        }
      />
    );
  }

  const w = warrantyStatus(product, settings.warrantyWarnDays);
  const r = returnStatus(product, settings.returnWarnDays);
  const openService = product.serviceRecords.find((s) => s.status !== "resolved");
  const returnLeft = daysUntil(product.returnDeadline);
  const warrantyLeft = daysUntil(product.warrantyEndDate);

  // "Şimdi ne yapmalıyım?" — en güçlü tekil sinyal
  const callToAction: {
    tone: "danger" | "warn" | "info" | "success";
    title: string;
    description: string;
    icon: React.ReactNode;
  } = (() => {
    if (product.returnProcess && product.returnProcess.status !== "completed") {
      return {
        tone: "info",
        title: "İade süreci devam ediyor",
        description: `Durum: ${RETURN_STATUS_LABEL[product.returnProcess.status]}.`,
        icon: <RotateCcw className="h-4 w-4" />,
      };
    }
    if (openService) {
      return {
        tone: "info",
        title: "Servis kaydın takipte",
        description: `${openService.company} — ${SERVICE_STATUS_LABEL[openService.status].toLowerCase()}.`,
        icon: <Wrench className="h-4 w-4" />,
      };
    }
    if (returnLeft >= 0 && returnLeft <= settings.returnWarnDays && !product.returnProcess) {
      return {
        tone: returnLeft <= 2 ? "danger" : "warn",
        title: `İade süresi ${humanizeDaysLeft(product.returnDeadline).toLowerCase()}`,
        description: "İade kararını verip mesajını şimdi gönderebilirsin.",
        icon: <RotateCcw className="h-4 w-4" />,
      };
    }
    if (warrantyLeft >= 0 && warrantyLeft <= settings.warrantyWarnDays) {
      return {
        tone: warrantyLeft <= 7 ? "danger" : "warn",
        title: `Garanti ${humanizeDaysLeft(product.warrantyEndDate).toLowerCase()}`,
        description: "Garanti hakkını kullanmak için süre bitmeden başvur.",
        icon: <ShieldCheck className="h-4 w-4" />,
      };
    }
    if (warrantyLeft < 0) {
      return {
        tone: "danger",
        title: "Garanti süresi geçti",
        description: "Bu ürün için artık garanti hakkın bulunmuyor.",
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    }
    return {
      tone: "success",
      title: "Her şey yolunda",
      description: "Bu ürün için şu an acil bir aksiyon yok.",
      icon: <Check className="h-4 w-4" />,
    };
  })();

  const onCopySellerMessage = async () => {
    const text =
      product.returnProcess?.sellerMessage || sellerReturnMessage(product.name);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      info("Mesaj kopyalandı.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      danger("Mesaj kopyalanamadı.");
    }
  };

  const onDelete = () => {
    if (typeof window !== "undefined" && !window.confirm("Ürünü silmek istediğine emin misin?")) {
      return;
    }
    deleteProduct(product.id);
    info(`${product.name} silindi.`);
    router.push("/app/products");
  };

  return (
    <div>
      <Link
        href="/app/products"
        className="hidden md:inline-flex items-center text-sm text-ink-600 hover:text-ink-900 gap-1 mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Ürünlere dön
      </Link>

      <PageHeader
        title={product.name}
        description={`${product.brand} · ${product.category}`}
        actions={
          <>
            <Button
              variant="outline"
              size="md"
              className="gap-2"
              onClick={() => {
                setEditNote(true);
                setNotesDraft(product.notes ?? "");
              }}
            >
              <Pencil className="h-4 w-4" /> Notu düzenle
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="gap-2 text-danger-600 hover:bg-danger-50"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" /> Sil
            </Button>
          </>
        }
      />

      {/* Üst durum şeridi */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        <ProductStatusBadge status={product.status} />
        <WarrantyStatusBadge status={w} />
        <ReturnStatusBadge status={r} />
        {openService && (
          <Badge tone="info" dot>
            <Wrench className="h-3 w-3 -ml-0.5" /> Açık servis kaydı
          </Badge>
        )}
      </div>

      {/* Ana çağrı: "şimdi ne yapmalıyım?" */}
      <AlertBanner
        tone={callToAction.tone}
        icon={callToAction.icon}
        title={callToAction.title}
        description={callToAction.description}
        className="mb-5"
      />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Sol kolon: bilgiler */}
        <div className="lg:col-span-2 space-y-5 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Satın alma bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                <Info label="Mağaza" value={product.store} />
                <Info label="Fiyat" value={formatCurrencyTRY(product.price)} />
                <Info
                  label="Satın alma tarihi"
                  value={formatDateTR(product.purchaseDate)}
                  icon={<Calendar className="h-4 w-4" />}
                />
                <Info
                  label="Fatura no"
                  value={product.invoiceNumber || "—"}
                  icon={<Receipt className="h-4 w-4" />}
                />
                <Info
                  label="Kargo takip no"
                  value={product.trackingNumber || "—"}
                  icon={<Truck className="h-4 w-4" />}
                />
              </dl>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand-700" />
                  Garanti
                </CardTitle>
                <CardDescription>{humanizeDaysLeft(product.warrantyEndDate)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Info label="Bitiş tarihi" value={formatDateTR(product.warrantyEndDate)} />
                <WarrantyStatusBadge status={w} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-brand-700" />
                  İade hakkı
                </CardTitle>
                <CardDescription>
                  {product.returnProcess
                    ? `Süreç başlatıldı: ${formatDateTR(product.returnProcess.requestDate)}`
                    : humanizeDaysLeft(product.returnDeadline)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Info label="Son tarih" value={formatDateTR(product.returnDeadline)} />
                <ReturnStatusBadge status={r} />
              </CardContent>
            </Card>
          </div>

          {/* Notlar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-brand-700" /> Notlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editNote ? (
                <div className="space-y-3">
                  <Textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder="Bu ürünle ilgili notların..."
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditNote(false);
                        setNotesDraft(product.notes ?? "");
                      }}
                    >
                      Vazgeç
                    </Button>
                    <Button
                      onClick={() => {
                        updateProduct(product.id, { notes: notesDraft.trim() || undefined });
                        setEditNote(false);
                        success("Notlar güncellendi.");
                      }}
                    >
                      Kaydet
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-700 whitespace-pre-wrap">
                  {product.notes || "Henüz not eklenmemiş."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Belgeler */}
          <Card>
            <CardHeader className="!pb-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-700" /> Belgeler
                </CardTitle>
                <CardDescription>Fatura, garanti, servis formu vb.</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 self-start"
                onClick={() => setShowDoc((v) => !v)}
              >
                <Plus className="h-4 w-4" /> Belge ekle
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {showDoc && (
                <DocumentForm
                  onAdd={(doc) => {
                    addDocument(product.id, doc);
                    setShowDoc(false);
                    success("Belge eklendi.");
                  }}
                  onCancel={() => setShowDoc(false)}
                />
              )}
              {product.documents.length === 0 ? (
                <p className="text-sm text-ink-500">Henüz belge eklenmemiş.</p>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {product.documents.map((d) => (
                    <li key={d.id} className="py-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700 shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-900 truncate">{d.name}</p>
                        <p className="text-xs text-ink-500">
                          {DOCUMENT_TYPE_LABEL[d.type]} · {formatDateTR(d.date)}
                        </p>
                      </div>
                      <Badge tone="neutral">Demo</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Servis geçmişi */}
          <Card>
            <CardHeader className="!pb-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-brand-700" /> Servis geçmişi
                </CardTitle>
                <CardDescription>Servis kayıtları ve takip tarihleri</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 self-start"
                onClick={() => setShowService((v) => !v)}
              >
                <Plus className="h-4 w-4" /> Servis kaydı
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {showService && (
                <ServiceForm
                  onAdd={(rec) => {
                    addServiceRecord(product.id, rec);
                    setShowService(false);
                    success("Servis kaydı eklendi.");
                  }}
                  onCancel={() => setShowService(false)}
                />
              )}
              {product.serviceRecords.length === 0 ? (
                <p className="text-sm text-ink-500">Henüz servis kaydı yok.</p>
              ) : (
                <ul className="space-y-3">
                  {product.serviceRecords.map((s) => (
                    <li key={s.id} className="rounded-xl border border-ink-100 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink-900 truncate">{s.company}</p>
                          <p className="text-xs text-ink-500 mt-0.5">
                            {formatDateTR(s.date)}
                            {s.nextFollowUpDate ? ` · Takip: ${formatDateTR(s.nextFollowUpDate)}` : ""}
                          </p>
                        </div>
                        <Badge
                          dot
                          tone={
                            s.status === "resolved"
                              ? "success"
                              : s.status === "in_progress"
                              ? "info"
                              : "warn"
                          }
                        >
                          {SERVICE_STATUS_LABEL[s.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-ink-700 mt-2">{s.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sağ kolon: aksiyonlar — mobilde önce gelsin */}
        <div className="space-y-5 order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>Hızlı aksiyonlar</CardTitle>
              <CardDescription>Tek tıkla süreç başlat.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start gap-2"
                onClick={() => {
                  if (product.returnProcess) {
                    info("İade süreci zaten başlatılmış.");
                    return;
                  }
                  setShowReturn(true);
                }}
                disabled={!!product.returnProcess}
              >
                <RotateCcw className="h-4 w-4" />{" "}
                {product.returnProcess ? "İade süreci başladı" : "İade süreci başlat"}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setShowService(true)}
              >
                <Wrench className="h-4 w-4" /> Servis kaydı ekle
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setShowDoc(true)}
              >
                <FileText className="h-4 w-4" /> Belge ekle
              </Button>
            </CardContent>
          </Card>

          {/* İade süreci */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-4 w-4 text-brand-700" /> İade süreci
              </CardTitle>
              <CardDescription>Başlattığın iadelerin durumu burada.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {showReturn && !product.returnProcess && (
                <ReturnForm
                  defaultMessage={sellerReturnMessage(product.name)}
                  onAdd={(data) => {
                    startReturn(product.id, data);
                    setShowReturn(false);
                    success("İade süreci başlatıldı.");
                  }}
                  onCancel={() => setShowReturn(false)}
                />
              )}

              {product.returnProcess ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <ReturnStatusBadge status={product.returnProcess.status} />
                    <span className="text-xs text-ink-500">
                      Talep: {formatDateTR(product.returnProcess.requestDate)}
                    </span>
                  </div>
                  {product.returnProcess.shippingCompany && (
                    <p className="text-sm text-ink-700">
                      <span className="text-ink-500">Kargo:</span> {product.returnProcess.shippingCompany}
                      {product.returnProcess.trackingNumber
                        ? ` · ${product.returnProcess.trackingNumber}`
                        : ""}
                    </p>
                  )}
                  {product.returnProcess.reason && (
                    <p className="text-sm text-ink-700">
                      <span className="text-ink-500">Sebep:</span> {product.returnProcess.reason}
                    </p>
                  )}
                  <div>
                    <Label htmlFor="status-update">Durumu güncelle</Label>
                    <Select
                      id="status-update"
                      value={product.returnProcess.status}
                      onChange={(e) => {
                        updateReturn(product.id, {
                          status: e.target.value as ReturnStatus,
                        });
                        success("İade durumu güncellendi.");
                      }}
                    >
                      {(
                        ["requested", "shipped", "refund_pending", "completed"] as ReturnStatus[]
                      ).map((s) => (
                        <option key={s} value={s}>
                          {RETURN_STATUS_LABEL[s]}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              ) : (
                !showReturn && (
                  <p className="text-sm text-ink-500">
                    Bu ürün için iade süreci başlatılmadı.
                  </p>
                )
              )}

              {/* Hazır mesaj */}
              <div className="rounded-xl bg-ink-50 border border-ink-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide">
                    Satıcıya gönderilecek örnek mesaj
                  </p>
                  <Button size="sm" variant="ghost" className="gap-1 -mr-1 -mt-1" onClick={onCopySellerMessage}>
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-accent-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Kopyalandı" : "Kopyala"}
                  </Button>
                </div>
                <p className="text-sm text-ink-700 mt-2 leading-relaxed">
                  {product.returnProcess?.sellerMessage || sellerReturnMessage(product.name)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Genel durum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Ürün durumu" value={PRODUCT_STATUS_LABEL[product.status]} />
              <Row label="Garanti bitiş" value={formatDateTR(product.warrantyEndDate)} />
              <Row label="İade son tarihi" value={formatDateTR(product.returnDeadline)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}

function Info({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs uppercase tracking-wide text-ink-500 flex items-center gap-1.5">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-ink-900 truncate">{value}</dd>
    </div>
  );
}

/* ---------------- Sub-forms ---------------- */

function DocumentForm({
  onAdd,
  onCancel,
}: {
  onAdd: (doc: { name: string; type: DocumentType; date: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<DocumentType>("invoice");
  const [date, setDate] = useState(todayIso());
  return (
    <div className="rounded-xl border border-ink-100 p-4 space-y-3 bg-ink-50/50">
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Label htmlFor="doc-name">Belge adı</Label>
          <Input
            id="doc-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn. Trendyol e-faturası"
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="doc-type">Tip</Label>
          <Select
            id="doc-type"
            value={type}
            onChange={(e) => setType(e.target.value as DocumentType)}
          >
            {Object.entries(DOCUMENT_TYPE_LABEL).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="doc-date">Tarih</Label>
          <Input id="doc-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="sm:col-span-2 flex items-end">
          <p className="text-xs text-ink-500">
            Dosya yükleme bu sürümde demo amaçlıdır. Belge adı ve tipi kaydedilir.
          </p>
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
        <Button variant="ghost" onClick={onCancel} className="sm:w-auto w-full">
          Vazgeç
        </Button>
        <Button
          disabled={!name.trim()}
          onClick={() => onAdd({ name: name.trim(), type, date })}
          className="sm:w-auto w-full"
        >
          Belge ekle
        </Button>
      </div>
    </div>
  );
}

function ServiceForm({
  onAdd,
  onCancel,
}: {
  onAdd: (rec: Omit<ServiceRecord, "id" | "productId">) => void;
  onCancel: () => void;
}) {
  const [company, setCompany] = useState("");
  const [date, setDate] = useState(todayIso());
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ServiceRecord["status"]>("open");
  const [hasForm, setHasForm] = useState(false);
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  return (
    <div className="rounded-xl border border-ink-100 p-4 space-y-3 bg-ink-50/50">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="svc-company">Servis firması</Label>
          <Input
            id="svc-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="svc-date">Servis tarihi</Label>
          <Input id="svc-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="svc-desc">Açıklama</Label>
        <Textarea
          id="svc-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Şikayet, talep, beklenen işlem..."
        />
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="svc-status">Durum</Label>
          <Select
            id="svc-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ServiceRecord["status"])}
          >
            <option value="open">Açık</option>
            <option value="in_progress">Devam ediyor</option>
            <option value="resolved">Tamamlandı</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="svc-next">Sonraki takip</Label>
          <Input
            id="svc-next"
            type="date"
            value={nextFollowUpDate}
            onChange={(e) => setNextFollowUpDate(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-ink-300"
              checked={hasForm}
              onChange={(e) => setHasForm(e.target.checked)}
            />
            Servis formu eklendi
          </label>
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
        <Button variant="ghost" onClick={onCancel} className="sm:w-auto w-full">
          Vazgeç
        </Button>
        <Button
          disabled={!company.trim() || !description.trim()}
          onClick={() =>
            onAdd({
              company: company.trim(),
              date,
              description: description.trim(),
              status,
              hasServiceForm: hasForm,
              nextFollowUpDate: nextFollowUpDate || undefined,
            })
          }
          className="sm:w-auto w-full"
        >
          Servis kaydı oluştur
        </Button>
      </div>
    </div>
  );
}

function ReturnForm({
  defaultMessage,
  onAdd,
  onCancel,
}: {
  defaultMessage: string;
  onAdd: (data: {
    reason: string;
    requestDate: string;
    shippingCompany?: string;
    trackingNumber?: string;
    status: ReturnStatus;
    sellerMessage?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  const [requestDate, setRequestDate] = useState(todayIso());
  const [shippingCompany, setShippingCompany] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [status, setStatus] = useState<ReturnStatus>("requested");
  const [sellerMessage, setSellerMessage] = useState(defaultMessage);
  return (
    <div className="rounded-xl border border-ink-100 p-4 space-y-3 bg-ink-50/50">
      <div>
        <Label htmlFor="r-reason">İade sebebi</Label>
        <Textarea
          id="r-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ürün hasarlı geldi, beklediğim gibi değildi vb."
          autoFocus
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="r-date">Talep tarihi</Label>
          <Input
            id="r-date"
            type="date"
            value={requestDate}
            onChange={(e) => setRequestDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="r-status">Son durum</Label>
          <Select
            id="r-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ReturnStatus)}
          >
            {(["requested", "shipped", "refund_pending", "completed"] as ReturnStatus[]).map(
              (s) => (
                <option key={s} value={s}>
                  {RETURN_STATUS_LABEL[s]}
                </option>
              ),
            )}
          </Select>
        </div>
        <div>
          <Label htmlFor="r-cargo">Kargo firması</Label>
          <Input
            id="r-cargo"
            value={shippingCompany}
            onChange={(e) => setShippingCompany(e.target.value)}
            placeholder="Aras, Yurtiçi, MNG..."
          />
        </div>
        <div>
          <Label htmlFor="r-track">Kargo takip no</Label>
          <Input
            id="r-track"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="r-msg">Satıcıya yazılacak not</Label>
        <Textarea
          id="r-msg"
          value={sellerMessage}
          onChange={(e) => setSellerMessage(e.target.value)}
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
        <Button variant="ghost" onClick={onCancel} className="sm:w-auto w-full">
          Vazgeç
        </Button>
        <Button
          disabled={!reason.trim()}
          onClick={() =>
            onAdd({
              reason: reason.trim(),
              requestDate,
              shippingCompany: shippingCompany.trim() || undefined,
              trackingNumber: trackingNumber.trim() || undefined,
              status,
              sellerMessage: sellerMessage.trim() || undefined,
            })
          }
          className="sm:w-auto w-full"
        >
          İade sürecini başlat
        </Button>
      </div>
    </div>
  );
}
