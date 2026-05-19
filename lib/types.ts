export type ProductStatus =
  | "active"
  | "return_in_progress"
  | "in_service"
  | "warranty_expiring"
  | "warranty_expired"
  | "return_expired";

export type ReturnStatus =
  | "eligible"
  | "deadline_soon"
  | "deadline_passed"
  | "requested"
  | "shipped"
  | "refund_pending"
  | "completed";

export type WarrantyStatus = "active" | "expiring_soon" | "expired";

export type RiskLevel = "low" | "medium" | "high";

export type DocumentType =
  | "invoice"
  | "warranty"
  | "service_form"
  | "shipping_receipt"
  | "return_request"
  | "other";

export interface AldimDocument {
  id: string;
  productId: string;
  name: string;
  type: DocumentType;
  date: string; // ISO yyyy-mm-dd
  fileUrl?: string;
  status?: string;
}

export interface ServiceRecord {
  id: string;
  productId: string;
  date: string;
  company: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  hasServiceForm?: boolean;
  nextFollowUpDate?: string;
}

export interface ReturnProcess {
  id: string;
  productId: string;
  reason: string;
  requestDate: string;
  shippingCompany?: string;
  trackingNumber?: string;
  status: ReturnStatus;
  sellerMessage?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  store: string;
  price: number;
  purchaseDate: string; // ISO
  warrantyEndDate: string; // ISO
  returnDeadline: string; // ISO
  invoiceNumber?: string;
  trackingNumber?: string;
  status: ProductStatus;
  notes?: string;
  documents: AldimDocument[];
  serviceRecords: ServiceRecord[];
  returnProcess?: ReturnProcess;
}

export interface AppSettings {
  profileName: string;
  notificationsEnabled: boolean;
  warrantyWarnDays: number; // garanti bitmesine kaç gün kala uyar
  returnWarnDays: number; // iade süresine kaç gün kala uyar
  theme: "light" | "system";
}
