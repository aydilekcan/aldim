import { daysUntil } from "./date-utils";
import type {
  DocumentType,
  Product,
  ProductStatus,
  ReturnStatus,
  RiskLevel,
  WarrantyStatus,
} from "./types";

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  invoice: "Fatura",
  warranty: "Garanti belgesi",
  service_form: "Servis formu",
  shipping_receipt: "Kargo fişi",
  return_request: "İade talebi",
  other: "Diğer",
};

export const SERVICE_STATUS_LABEL: Record<
  "open" | "in_progress" | "resolved",
  string
> = {
  open: "Açık",
  in_progress: "Devam ediyor",
  resolved: "Tamamlandı",
};

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  active: "Aktif",
  return_in_progress: "İade sürecinde",
  in_service: "Serviste",
  warranty_expiring: "Garanti bitmek üzere",
  warranty_expired: "Garanti bitti",
  return_expired: "İade süresi geçti",
};

export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  eligible: "İade hakkı var",
  deadline_soon: "İade süresi yaklaşıyor",
  deadline_passed: "İade süresi geçti",
  requested: "İade talebi açıldı",
  shipped: "Kargoya verildi",
  refund_pending: "Ücret iadesi bekleniyor",
  completed: "Tamamlandı",
};

export const WARRANTY_STATUS_LABEL: Record<WarrantyStatus, string> = {
  active: "Garanti aktif",
  expiring_soon: "Garanti bitmek üzere",
  expired: "Garanti bitti",
};

export function warrantyStatus(
  p: Pick<Product, "warrantyEndDate">,
  warnDays = 30,
): WarrantyStatus {
  const left = daysUntil(p.warrantyEndDate);
  if (left < 0) return "expired";
  if (left <= warnDays) return "expiring_soon";
  return "active";
}

export function returnStatus(
  p: Pick<Product, "returnDeadline" | "returnProcess">,
  warnDays = 5,
): ReturnStatus {
  if (p.returnProcess) return p.returnProcess.status;
  const left = daysUntil(p.returnDeadline);
  if (left < 0) return "deadline_passed";
  if (left <= warnDays) return "deadline_soon";
  return "eligible";
}

export function computeProductStatus(
  p: Pick<Product, "warrantyEndDate" | "returnDeadline" | "returnProcess" | "serviceRecords" | "status">,
  warnDays = 30,
): ProductStatus {
  // Açık servis kaydı varsa en güçlü sinyal.
  const openService = p.serviceRecords?.some((s) => s.status !== "resolved");
  if (openService) return "in_service";
  if (p.returnProcess && p.returnProcess.status !== "completed") {
    return "return_in_progress";
  }
  const w = warrantyStatus(p, warnDays);
  if (w === "expired") return "warranty_expired";
  if (w === "expiring_soon") return "warranty_expiring";
  const r = returnStatus(p);
  if (r === "deadline_passed") return "return_expired";
  return "active";
}

export function riskLevel(
  p: Pick<
    Product,
    "warrantyEndDate" | "returnDeadline" | "returnProcess" | "serviceRecords"
  >,
): RiskLevel {
  const warrantyLeft = daysUntil(p.warrantyEndDate);
  const returnLeft = daysUntil(p.returnDeadline);
  const hasOpenService = p.serviceRecords?.some((s) => s.status !== "resolved");
  const inReturn = p.returnProcess && p.returnProcess.status !== "completed";

  if (
    hasOpenService ||
    inReturn ||
    (returnLeft >= 0 && returnLeft <= 3) ||
    (warrantyLeft >= 0 && warrantyLeft <= 15)
  ) {
    return "high";
  }
  if (
    (returnLeft >= 0 && returnLeft <= 10) ||
    (warrantyLeft >= 0 && warrantyLeft <= 60)
  ) {
    return "medium";
  }
  return "low";
}

export type Tone = "neutral" | "success" | "warn" | "danger" | "info";

export function productStatusTone(s: ProductStatus): Tone {
  switch (s) {
    case "active":
      return "success";
    case "warranty_expiring":
      return "warn";
    case "return_in_progress":
    case "in_service":
      return "info";
    case "warranty_expired":
    case "return_expired":
      return "danger";
  }
}

export function returnStatusTone(s: ReturnStatus): Tone {
  switch (s) {
    case "eligible":
      return "success";
    case "deadline_soon":
    case "requested":
    case "shipped":
    case "refund_pending":
      return "warn";
    case "deadline_passed":
      return "danger";
    case "completed":
      return "success";
  }
}

export function warrantyStatusTone(s: WarrantyStatus): Tone {
  switch (s) {
    case "active":
      return "success";
    case "expiring_soon":
      return "warn";
    case "expired":
      return "danger";
  }
}
