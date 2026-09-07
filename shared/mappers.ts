import { CATEGORIES } from "./categories";
import type {
  AldimDocument,
  AldimItem,
  AppSettings,
  ItemCategory,
  ItemFieldValue,
  Reminder,
  ReminderStatus,
  ReminderType,
  ServiceRecord,
} from "./types";

/* ----------------------------------------------------------------------
 * Supabase row ↔ mobile model mapping
 *
 * - camelCase ↔ snake_case dönüşümleri
 * - JSON kolonları güvenli parse (bozuk veri uygulamayı çökertmez)
 * - Bilinmeyen kategori → "other" fallback
 * - Bilinmeyen enum değerleri → güvenli default
 * ------------------------------------------------------------------- */

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asArray<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function asNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function asCategory(v: unknown): ItemCategory {
  if (typeof v === "string" && v in CATEGORIES) return v as ItemCategory;
  return "other";
}

function asItemStatus(v: unknown): AldimItem["status"] {
  return v === "archived" ? "archived" : "active";
}

function asReminderStatus(v: unknown): ReminderStatus {
  if (v === "completed") return "completed";
  if (v === "expired") return "expired";
  return "active";
}

/* ---------------- Items ---------------- */

export interface ItemRow {
  id: string;
  user_id: string;
  category: string;
  title: string;
  brand: string | null;
  model: string | null;
  store: string | null;
  price: number | null;
  purchase_date: string | null;
  notes: string | null;
  status: string;
  fields: unknown;
  documents: unknown;
  service_records: unknown;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function itemToRow(item: AldimItem): Omit<ItemRow, "created_at"> & {
  created_at?: string;
} {
  return {
    id: item.id,
    user_id: item.userId,
    category: item.category,
    title: item.title,
    brand: item.brand ?? null,
    model: item.model ?? null,
    store: item.store ?? null,
    price: item.price ?? null,
    purchase_date: item.purchaseDate ?? null,
    notes: item.notes ?? null,
    status: item.status,
    fields: item.fields,
    documents: [],
    service_records: item.serviceRecords,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    deleted_at: null,
  };
}

export function rowToItem(row: ItemRow): AldimItem {
  return {
    id: row.id,
    userId: row.user_id,
    category: asCategory(row.category),
    title: typeof row.title === "string" ? row.title : "(başlıksız)",
    brand: asString(row.brand),
    model: asString(row.model),
    store: asString(row.store),
    price: row.price == null ? undefined : asNumber(row.price),
    purchaseDate: asString(row.purchase_date),
    notes: asString(row.notes),
    status: asItemStatus(row.status),
    fields: isObject(row.fields)
      ? (row.fields as Record<string, ItemFieldValue>)
      : {},
    documents: asArray<AldimDocument>(row.documents),
    serviceRecords: asArray<ServiceRecord>(row.service_records),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* ---------------- Reminders ---------------- */

export interface ReminderRow {
  id: string;
  user_id: string;
  item_id: string;
  item_title: string | null;
  item_category: string | null;
  source_field: string | null;
  title: string | null;
  type: string | null;
  due_date: string | null;
  notify_before_days: unknown;
  notification_ids: unknown;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function reminderToRow(r: Reminder): Omit<ReminderRow, "created_at"> & {
  created_at?: string;
} {
  return {
    id: r.id,
    user_id: r.userId,
    item_id: r.itemId,
    item_title: r.itemTitle,
    item_category: r.itemCategory,
    source_field: r.sourceField,
    title: r.title,
    type: r.type,
    due_date: r.dueDate,
    notify_before_days: r.notifyBeforeDays,
    notification_ids: [],
    status: r.status,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
    deleted_at: null,
  };
}

export function rowToReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    userId: row.user_id,
    itemId: row.item_id,
    itemTitle: row.item_title ?? "",
    itemCategory: asCategory(row.item_category),
    sourceField: row.source_field ?? "",
    title: row.title ?? "Hatırlatma",
    type: (row.type as ReminderType) ?? "generic_deadline",
    dueDate: row.due_date ?? "",
    notifyBeforeDays: asArray<unknown>(row.notify_before_days).filter(
      (n): n is number => typeof n === "number",
    ),
    notificationIds: asArray<unknown>(row.notification_ids).filter(
      (s): s is string => typeof s === "string",
    ),
    status: asReminderStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* ---------------- Documents ---------------- */

export interface DocumentRow {
  id: string;
  user_id: string;
  item_id: string | null;
  item_title: string | null;
  item_category: string | null;
  name: string | null;
  type: string | null;
  date: string | null;
  file_uri: string | null;
  remote_url: string | null;
  storage_path: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function documentToRow(d: AldimDocument): Omit<
  DocumentRow,
  "created_at"
> & { created_at?: string; storage_path: string | null } {
  return {
    id: d.id,
    user_id: d.userId,
    item_id: d.itemId,
    item_title: d.itemTitle,
    item_category: d.itemCategory,
    name: d.name,
    type: d.type,
    date: d.date,
    // file_uri cihaz bazlı — yine de cloud'a meta için kaydediyoruz.
    file_uri: null,
    remote_url: d.remoteUrl ?? null,
    storage_path: d.storagePath ?? null,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
    deleted_at: null,
  };
}

export function rowToDocument(row: DocumentRow): AldimDocument {
  return {
    id: row.id,
    userId: row.user_id,
    itemId: row.item_id ?? "",
    itemTitle: row.item_title ?? "",
    itemCategory: asCategory(row.item_category),
    name: row.name ?? "Belge",
    type: (row.type as AldimDocument["type"]) ?? "other",
    date: row.date ?? "",
    fileUri: undefined,
    remoteUrl: asString(row.remote_url),
    storagePath: asString(row.storage_path),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* ---------------- Settings ---------------- */

export interface SettingsRow {
  user_id: string;
  notifications_enabled: boolean;
  daily_notify_hour: number;
  reminder_preferences: unknown;
  created_at: string;
  updated_at: string;
}

export function settingsToRow(
  s: AppSettings,
  userId: string,
): Omit<SettingsRow, "created_at" | "updated_at"> {
  return {
    user_id: userId,
    notifications_enabled: s.notificationsEnabled,
    daily_notify_hour: 10,
    reminder_preferences: { onboardingComplete: s.onboardingComplete, emailEnabled: s.emailEnabled !== false, smsEnabled: s.smsEnabled === true, phone: s.phone ?? "" },
  };
}

export function rowToSettings(row: SettingsRow): AppSettings {
  const prefs = isObject(row.reminder_preferences)
    ? row.reminder_preferences
    : {};
  const onboardingComplete = prefs.onboardingComplete;
  return {
    notificationsEnabled: row.notifications_enabled,
    emailEnabled: prefs.emailEnabled !== false,
    smsEnabled: prefs.smsEnabled === true,
    phone: typeof prefs.phone === "string" ? prefs.phone : "",
    onboardingComplete:
      typeof onboardingComplete === "boolean" ? onboardingComplete : true,
  };
}
