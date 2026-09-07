/* ----------------------------------------------------------------------
 * Aldım veri modeli
 *
 * Tek bir "AldimItem" 11 kategoriden birine ait olabilir. Ortak alanlar
 * üst seviyede, kategoriye özel alanlar `fields` map'inde saklanır.
 * Hatırlatmalar (Reminder) ayrı koleksiyondur ve `itemId` ile bağlanır.
 * ------------------------------------------------------------------- */

export type ItemCategory =
  | "electronics"
  | "white_goods"
  | "small_appliance"
  | "furniture"
  | "clothing"
  | "vehicle"
  | "home_bill"
  | "insurance"
  | "subscription"
  | "service"
  | "other";

export type DocumentType =
  | "invoice"
  | "warranty"
  | "service_form"
  | "shipping_receipt"
  | "policy"
  | "registration"
  | "inspection"
  | "return_request"
  | "bill"
  | "other";

export type ReminderType =
  | "return_deadline"
  | "warranty_end"
  | "extended_warranty_end"
  | "service_follow_up"
  | "maintenance"
  | "delivery"
  | "installation"
  | "vehicle_inspection"
  | "exhaust_inspection"
  | "traffic_insurance"
  | "kasko"
  | "mtv"
  | "traffic_fine"
  | "bill_due"
  | "policy_end"
  | "subscription_renewal"
  | "commitment_end"
  | "generic_deadline";

export type ReminderStatus = "active" | "completed" | "expired";

export interface AldimDocument {
  id: string;
  userId: string;
  itemId: string;
  /** Bağlı kayıt başlığı — denormalize: listede/detayda hızlı gösterim için. */
  itemTitle: string;
  /** Bağlı kayıt kategorisi — denormalize: filtre/ikon için. */
  itemCategory: ItemCategory;
  name: string;
  type: DocumentType;
  date: string; // YYYY-MM-DD
  fileUri?: string;
  /** Future-proofing — cloud sync eklendiğinde Supabase Storage URL'i. */
  remoteUrl?: string;
  /** Supabase Storage bucket içindeki yol: {userId}/{itemId}/{docId}.{ext} */
  storagePath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRecord {
  id: string;
  itemId: string;
  date: string;
  company: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  nextFollowUpDate?: string;
  hasServiceForm?: boolean;
}

/** Kategoriye özel alanların dinamik değer tipi. */
export type ItemFieldValue = string | number | boolean | undefined;

export interface AldimItem {
  id: string;
  userId: string;
  category: ItemCategory;
  title: string;
  // Çoğu kategoride ortak — yoksa undefined
  brand?: string;
  model?: string;
  store?: string;
  price?: number;
  purchaseDate?: string;
  notes?: string;
  status: "active" | "archived";
  /** Kategoriye özel alanlar (tarihler, abone no, plaka, vb.) */
  fields: Record<string, ItemFieldValue>;
  documents: AldimDocument[];
  serviceRecords: ServiceRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  type: ReminderType;
  itemId: string;
  itemTitle: string;
  itemCategory: ItemCategory;
  /** Reminder'ı tetikleyen field key — düzenlemede tekrar bulmak için. */
  sourceField: string;
  dueDate: string;
  notifyBeforeDays: number[];
  notificationIds: string[];
  status: ReminderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  onboardingComplete: boolean;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  phone?: string;
}

/** Kategori bazlı varsayılan "kaç gün önce" eşikleri. */
export const DEFAULT_NOTIFY_DAYS = {
  return: [3, 1],
  warranty: [30, 7],
  extendedWarranty: [30, 7],
  serviceFollowUp: [7],
  maintenance: [15, 3],
  delivery: [1],
  installation: [1],
  vehicleInspection: [30, 7],
  exhaustInspection: [30, 7],
  insurance: [15, 3],
  mtv: [7, 1],
  trafficFine: [7, 1],
  billDue: [3, 1],
  policyEnd: [30, 7],
  policyRenewal: [15, 3],
  subscriptionRenewal: [3, 1],
  commitmentEnd: [30, 7],
  genericDeadline: [3, 1],
  lastInstallment: [7],
  tireChange: [7],
} as const;
