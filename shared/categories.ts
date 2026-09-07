import type { DocumentType, ItemCategory, ReminderType } from "./types";
import { DEFAULT_NOTIFY_DAYS } from "./types";

/* ----------------------------------------------------------------------
 * Kategori şemaları
 *
 * Her kategori için:
 *  - label / description / examples / icon : UI gösterimi
 *  - titleLabel               : "Ürün adı" / "Plaka" / "Fatura adı" gibi başlık etiketi
 *  - submitLabel              : Form kaydet butonu metni
 *  - successMessage           : Kaydetten sonraki Alert mesajı
 *  - fields                   : Forma render edilecek alanlar (sırayla)
 *      - essential?: boolean → form ilk açıldığında görünür; false ise
 *        "Detaylı bilgileri ekle" accordion altında saklanır
 *  - reminders                : Hangi field'lara göre hatırlatma üretileceği
 * ------------------------------------------------------------------- */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "date"
  | "select"
  | "boolean";

export interface FieldSpec {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** true → üst seviye Item property'si; false → fields map'i */
  topLevel?: boolean;
  /** true → form ilk açılışta görünür; false → "Detaylı bilgiler" accordion altında */
  essential?: boolean;
}

export interface ReminderSpec {
  type: ReminderType;
  fieldKey: string;
  titleTemplate: string;
  bodyTemplate: string;
  notifyBeforeDays: number[];
}

export interface CategorySpec {
  category: ItemCategory;
  label: string;
  description: string;
  /** Kart altındaki örnek satırı — "Telefon, laptop, kulaklık" vb. */
  examples: string;
  icon:
    | "bed-outline"
    | "build-outline"
    | "cafe-outline"
    | "car-sport-outline"
    | "cube-outline"
    | "ellipsis-horizontal-outline"
    | "flash-outline"
    | "phone-portrait-outline"
    | "play-circle-outline"
    | "shield-half-outline"
    | "shirt-outline";
  titleLabel: string;
  submitLabel: string;
  /** Hatırlatma kurulduktan sonra gösterilen başarı metni (izin verildiyse) */
  successMessage: string;
  /** Bu kategoride belge eklerken sunulan tip seçenekleri — ilki default seçilir. */
  defaultDocumentTypes: DocumentType[];
  fields: FieldSpec[];
  reminders: ReminderSpec[];
}

/* ---------------- Ortak field helper'ları ---------------- */

const f = {
  brand: (label = "Marka", essential = true): FieldSpec => ({
    key: "brand",
    label,
    type: "text",
    topLevel: true,
    essential,
  }),
  model: (essential = false): FieldSpec => ({
    key: "model",
    label: "Model",
    type: "text",
    topLevel: true,
    essential,
  }),
  store: (label = "Satın alınan yer", essential = true): FieldSpec => ({
    key: "store",
    label,
    type: "text",
    topLevel: true,
    essential,
  }),
  purchaseDate: (label = "Satın alma tarihi", essential = true): FieldSpec => ({
    key: "purchaseDate",
    label,
    type: "date",
    topLevel: true,
    essential,
  }),
  price: (label = "Fiyat (₺)", essential = true): FieldSpec => ({
    key: "price",
    label,
    type: "currency",
    topLevel: true,
    essential,
  }),
  notes: (): FieldSpec => ({
    key: "notes",
    label: "Not",
    type: "textarea",
    topLevel: true,
    hint: "Opsiyonel",
    essential: false,
  }),
};

/* ---------------- Kategori spec'leri ---------------- */

export const CATEGORIES: Record<ItemCategory, CategorySpec> = {
  electronics: {
    category: "electronics",
    label: "Elektronik",
    description: "Garanti, iade ve servis takibi",
    examples: "Telefon, laptop, kulaklık",
    icon: "phone-portrait-outline",
    titleLabel: "Ürün adı",
    submitLabel: "Ürünü kaydet",
    successMessage: "Ürün kaydedildi. Garanti ve iade hatırlatmaları kuruldu.",
    defaultDocumentTypes: ["invoice", "warranty", "other"],
    fields: [
      {
        key: "title",
        label: "Ürün adı",
        type: "text",
        required: true,
        topLevel: true,
        essential: true,
      },
      f.brand(),
      f.store(),
      f.purchaseDate(),
      f.price(),
      {
        key: "warrantyEndDate",
        label: "Garanti bitiş tarihi",
        type: "date",
        essential: true,
        hint: "Bilmiyorsan boş bırakabilirsin.",
      },
      {
        key: "returnDeadline",
        label: "İade son tarihi",
        type: "date",
        essential: true,
        hint: "Online alışverişlerde genelde teslimden sonra 14 gün olabilir. Emin değilsen kontrol et.",
      },
      // Detaylı
      f.model(),
      {
        key: "serialNumber",
        label: "Seri no",
        type: "text",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "invoiceNumber",
        label: "Fatura no",
        type: "text",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "serviceFollowUpDate",
        label: "Servis takip tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      f.notes(),
    ],
    reminders: [
      {
        type: "return_deadline",
        fieldKey: "returnDeadline",
        titleTemplate: "İade süresi yaklaşıyor",
        bodyTemplate: "{{title}} için iade süresine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.return],
      },
      {
        type: "warranty_end",
        fieldKey: "warrantyEndDate",
        titleTemplate: "Garanti süresi yaklaşıyor",
        bodyTemplate:
          "{{title}} için garanti bitişine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.warranty],
      },
      {
        type: "service_follow_up",
        fieldKey: "serviceFollowUpDate",
        titleTemplate: "Servis takibi yaklaşıyor",
        bodyTemplate:
          "{{title}} için servis takibine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.serviceFollowUp],
      },
    ],
  },

  white_goods: {
    category: "white_goods",
    label: "Beyaz eşya",
    description: "Garanti, kurulum ve bakım",
    examples: "Buzdolabı, kombi, klima",
    icon: "cube-outline",
    titleLabel: "Ürün adı",
    submitLabel: "Ürünü kaydet",
    successMessage: "Ürün kaydedildi. Garanti ve bakım hatırlatmaları kuruldu.",
    defaultDocumentTypes: ["invoice", "warranty", "service_form", "other"],
    fields: [
      {
        key: "title",
        label: "Ürün adı",
        type: "text",
        required: true,
        topLevel: true,
        essential: true,
      },
      f.brand(),
      f.model(true),
      f.purchaseDate(),
      {
        key: "warrantyEndDate",
        label: "Garanti bitiş tarihi",
        type: "date",
        essential: true,
        hint: "Bilmiyorsan boş bırakabilirsin.",
      },
      {
        key: "installationDate",
        label: "Kurulum tarihi",
        type: "date",
        essential: true,
        hint: "Opsiyonel",
      },
      // Detaylı
      f.store("Satın alınan yer", false),
      f.price("Fiyat (₺)", false),
      {
        key: "serialNumber",
        label: "Seri no",
        type: "text",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "invoiceNumber",
        label: "Fatura no",
        type: "text",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "extendedWarrantyEndDate",
        label: "Ek garanti bitiş tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "serviceCompany",
        label: "Yetkili servis adı",
        type: "text",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "lastMaintenanceDate",
        label: "Son bakım tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "nextMaintenanceDate",
        label: "Sonraki bakım tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      f.notes(),
    ],
    reminders: [
      {
        type: "warranty_end",
        fieldKey: "warrantyEndDate",
        titleTemplate: "Garanti süresi yaklaşıyor",
        bodyTemplate:
          "{{title}} için garanti bitişine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.warranty],
      },
      {
        type: "extended_warranty_end",
        fieldKey: "extendedWarrantyEndDate",
        titleTemplate: "Ek garanti süresi yaklaşıyor",
        bodyTemplate:
          "{{title}} için ek garanti bitişine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.extendedWarranty],
      },
      {
        type: "maintenance",
        fieldKey: "nextMaintenanceDate",
        titleTemplate: "Bakım zamanı yaklaşıyor",
        bodyTemplate: "{{title}} bakımına {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.maintenance],
      },
    ],
  },

  small_appliance: {
    category: "small_appliance",
    label: "Küçük ev aleti",
    description: "Garanti, iade ve servis takibi",
    examples: "Kahve makinesi, süpürge, airfryer, ütü",
    icon: "cafe-outline",
    titleLabel: "Ürün adı",
    submitLabel: "Ürünü kaydet",
    successMessage: "Ürün kaydedildi. Garanti ve iade hatırlatmaları kuruldu.",
    defaultDocumentTypes: ["invoice", "warranty", "other"],
    fields: [
      {
        key: "title",
        label: "Ürün adı",
        type: "text",
        required: true,
        topLevel: true,
        essential: true,
      },
      f.brand(),
      f.store(),
      f.purchaseDate(),
      f.price(),
      {
        key: "warrantyEndDate",
        label: "Garanti bitiş tarihi",
        type: "date",
        essential: true,
        hint: "Bilmiyorsan boş bırakabilirsin.",
      },
      {
        key: "returnDeadline",
        label: "İade son tarihi",
        type: "date",
        essential: true,
        hint: "Online alışverişlerde genelde 14 gün.",
      },
      // Detaylı
      f.model(),
      {
        key: "invoiceNumber",
        label: "Fatura no",
        type: "text",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "serviceFollowUpDate",
        label: "Servis takip tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      f.notes(),
    ],
    reminders: [
      {
        type: "return_deadline",
        fieldKey: "returnDeadline",
        titleTemplate: "İade süresi yaklaşıyor",
        bodyTemplate: "{{title}} için iade süresine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.return],
      },
      {
        type: "warranty_end",
        fieldKey: "warrantyEndDate",
        titleTemplate: "Garanti süresi yaklaşıyor",
        bodyTemplate:
          "{{title}} için garanti bitişine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.warranty],
      },
      {
        type: "service_follow_up",
        fieldKey: "serviceFollowUpDate",
        titleTemplate: "Servis takibi yaklaşıyor",
        bodyTemplate:
          "{{title}} için servis takibine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.serviceFollowUp],
      },
    ],
  },

  furniture: {
    category: "furniture",
    label: "Mobilya",
    description: "Teslimat, montaj ve garanti",
    examples: "Koltuk, masa, yatak, dolap",
    icon: "bed-outline",
    titleLabel: "Ürün adı",
    submitLabel: "Ürünü kaydet",
    successMessage:
      "Ürün kaydedildi. Teslimat ve garanti hatırlatmaları kuruldu.",
    defaultDocumentTypes: ["invoice", "warranty", "other"],
    fields: [
      {
        key: "title",
        label: "Ürün adı",
        type: "text",
        required: true,
        topLevel: true,
        essential: true,
      },
      f.brand("Marka / mağaza"),
      f.purchaseDate(),
      {
        key: "deliveryDate",
        label: "Teslimat tarihi",
        type: "date",
        essential: true,
      },
      f.price(),
      // Detaylı
      f.store("Satın alınan yer", false),
      {
        key: "installationDate",
        label: "Montaj tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "invoiceNumber",
        label: "Fatura no",
        type: "text",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "warrantyEndDate",
        label: "Garanti bitiş tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "returnDeadline",
        label: "İade / değişim son tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "specsNote",
        label: "Ölçü / renk / kumaş notu",
        type: "textarea",
        hint: "Opsiyonel",
        essential: false,
      },
      f.notes(),
    ],
    reminders: [
      {
        type: "delivery",
        fieldKey: "deliveryDate",
        titleTemplate: "Teslimat günü yaklaşıyor",
        bodyTemplate: "{{title}} teslimatına {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.delivery],
      },
      {
        type: "installation",
        fieldKey: "installationDate",
        titleTemplate: "Montaj günü yaklaşıyor",
        bodyTemplate: "{{title}} montajına {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.installation],
      },
      {
        type: "return_deadline",
        fieldKey: "returnDeadline",
        titleTemplate: "İade / değişim süresi yaklaşıyor",
        bodyTemplate: "{{title}} için iade süresine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.return],
      },
      {
        type: "warranty_end",
        fieldKey: "warrantyEndDate",
        titleTemplate: "Garanti süresi yaklaşıyor",
        bodyTemplate:
          "{{title}} için garanti bitişine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.warranty],
      },
    ],
  },

  clothing: {
    category: "clothing",
    label: "Giyim / ayakkabı",
    description: "İade ve değişim takibi",
    examples: "Giysi, ayakkabı, aksesuar",
    icon: "shirt-outline",
    titleLabel: "Ürün adı",
    submitLabel: "Ürünü kaydet",
    successMessage: "Ürün kaydedildi. İade hatırlatması kuruldu.",
    defaultDocumentTypes: ["invoice", "return_request", "other"],
    fields: [
      {
        key: "title",
        label: "Ürün adı",
        type: "text",
        required: true,
        topLevel: true,
        essential: true,
      },
      f.brand(),
      f.purchaseDate(),
      f.price(),
      {
        key: "returnDeadline",
        label: "İade / değişim son tarihi",
        type: "date",
        essential: true,
        hint: "Online alışverişlerde genelde 14 gün.",
      },
      // Detaylı
      f.store("Satın alınan yer", false),
      {
        key: "size",
        label: "Beden / numara",
        type: "text",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "color",
        label: "Renk",
        type: "text",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "invoiceNumber",
        label: "Fatura no",
        type: "text",
        hint: "Opsiyonel",
        essential: false,
      },
      f.notes(),
    ],
    reminders: [
      {
        type: "return_deadline",
        fieldKey: "returnDeadline",
        titleTemplate: "İade / değişim süresi yaklaşıyor",
        bodyTemplate: "{{title}} için iade süresine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.return],
      },
    ],
  },

  vehicle: {
    category: "vehicle",
    label: "Araç",
    description: "Muayene, MTV, sigorta ve bakım",
    examples: "Otomobil, motosiklet",
    icon: "car-sport-outline",
    titleLabel: "Araç adı",
    submitLabel: "Aracı kaydet",
    successMessage:
      "Araç kaydedildi. Muayene, MTV ve sigorta hatırlatmaları kuruldu.",
    defaultDocumentTypes: ["registration", "policy", "inspection", "other"],
    fields: [
      {
        key: "title",
        label: "Araç adı",
        type: "text",
        required: true,
        topLevel: true,
        essential: true,
        placeholder: "Örn. Eşin arabası",
      },
      {
        key: "plate",
        label: "Plaka",
        type: "text",
        required: true,
        essential: true,
        placeholder: "34 ABC 123",
      },
      f.brand(),
      f.model(true),
      {
        key: "nextInspectionDate",
        label: "Sıradaki muayene tarihi",
        type: "date",
        essential: true,
      },
      {
        key: "mtvPaymentDate",
        label: "MTV ödeme tarihi",
        type: "date",
        essential: true,
        hint: "Resmi sorgulama yapmaz; girdiğin tarihe göre hatırlatır.",
      },
      {
        key: "trafficInsuranceEndDate",
        label: "Trafik sigortası bitiş",
        type: "date",
        essential: true,
      },
      // Detaylı
      {
        key: "modelYear",
        label: "Model yılı",
        type: "number",
        essential: false,
      },
      f.purchaseDate("Satın alma tarihi", false),
      {
        key: "kaskoEndDate",
        label: "Kasko bitiş tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "exhaustInspectionDate",
        label: "Egzoz muayene tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "trafficFineDueDate",
        label: "Trafik cezası ödeme tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "inspectionDate",
        label: "Mevcut muayene tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "lastMaintenanceDate",
        label: "Son bakım tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "lastMaintenanceKm",
        label: "Son bakım kilometresi",
        type: "number",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "nextMaintenanceDate",
        label: "Sıradaki bakım tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "nextMaintenanceKm",
        label: "Sıradaki bakım kilometresi",
        type: "number",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "tireChangeDate",
        label: "Lastik değişim tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      f.notes(),
    ],
    reminders: [
      {
        type: "vehicle_inspection",
        fieldKey: "nextInspectionDate",
        titleTemplate: "Muayene tarihi yaklaşıyor",
        bodyTemplate:
          "{{title}} için sıradaki muayeneye {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.vehicleInspection],
      },
      {
        type: "exhaust_inspection",
        fieldKey: "exhaustInspectionDate",
        titleTemplate: "Egzoz muayene tarihi yaklaşıyor",
        bodyTemplate: "{{title}} egzoz muayenesine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.exhaustInspection],
      },
      {
        type: "traffic_insurance",
        fieldKey: "trafficInsuranceEndDate",
        titleTemplate: "Trafik sigortası yenileme zamanı",
        bodyTemplate:
          "{{title}} trafik sigortasının bitmesine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.insurance],
      },
      {
        type: "kasko",
        fieldKey: "kaskoEndDate",
        titleTemplate: "Kasko yenileme zamanı",
        bodyTemplate:
          "{{title}} kaskosunun bitmesine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.insurance],
      },
      {
        type: "mtv",
        fieldKey: "mtvPaymentDate",
        titleTemplate: "MTV ödeme tarihi yaklaşıyor",
        bodyTemplate: "{{title}} için MTV ödeme tarihini kaçırma.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.mtv],
      },
      {
        type: "traffic_fine",
        fieldKey: "trafficFineDueDate",
        titleTemplate: "Trafik cezası son ödeme yaklaşıyor",
        bodyTemplate:
          "{{title}} için trafik cezası ödemesine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.trafficFine],
      },
      {
        type: "maintenance",
        fieldKey: "nextMaintenanceDate",
        titleTemplate: "Bakım zamanı yaklaşıyor",
        bodyTemplate: "{{title}} bakımına {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.maintenance],
      },
      {
        type: "generic_deadline",
        fieldKey: "tireChangeDate",
        titleTemplate: "Lastik değişim tarihi yaklaşıyor",
        bodyTemplate:
          "{{title}} için lastik değişimine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.tireChange],
      },
    ],
  },

  home_bill: {
    category: "home_bill",
    label: "Ev faturası",
    description: "Son ödeme tarihi ve abone bilgileri",
    examples: "Elektrik, su, doğal gaz, internet",
    icon: "flash-outline",
    titleLabel: "Fatura adı",
    submitLabel: "Faturayı kaydet",
    successMessage: "Fatura kaydedildi. Son ödeme hatırlatması kuruldu.",
    defaultDocumentTypes: ["bill", "invoice", "other"],
    fields: [
      {
        key: "recurring",
        label: "Tekrarlansın mı?",
        type: "boolean",
        essential: true,
      },
      {
        key: "title",
        label: "Fatura adı",
        type: "text",
        required: true,
        topLevel: true,
        essential: true,
        placeholder: "Örn. Elektrik",
      },
      {
        key: "billType",
        label: "Fatura türü",
        type: "select",
        essential: true,
        options: [
          { value: "electricity", label: "Elektrik" },
          { value: "water", label: "Su" },
          { value: "natural_gas", label: "Doğal gaz" },
          { value: "internet", label: "İnternet" },
          { value: "hoa", label: "Aidat" },
          { value: "other", label: "Diğer" },
        ],
      },
      f.brand("Kurum / sağlayıcı"),
      {
        key: "subscriberNumber",
        label: "Abone no",
        type: "text",
        essential: true,
      },
      {
        key: "dueDate",
        label: "Son ödeme tarihi",
        type: "date",
        required: true,
        essential: true,
        hint: "Bu tarihten önce bildirim alırsın.",
      },
      {
        key: "amount",
        label: "Fatura tutarı (₺)",
        type: "currency",
        essential: true,
      },
      {
        key: "autoPayment",
        label: "Otomatik ödeme var mı?",
        type: "boolean",
        essential: true,
      },
      // Detaylı
      {
        key: "contractAccountNumber",
        label: "Sözleşme hesap no",
        type: "text",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "installationNumber",
        label: "Tesisat no",
        type: "text",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "period",
        label: "Dönem",
        type: "text",
        hint: "Opsiyonel — örn. 2026/05",
        essential: false,
      },
      {
        key: "recurrencePeriod",
        label: "Tekrar periyodu",
        type: "select",
        options: [
          { value: "monthly", label: "Aylık" },
          { value: "bimonthly", label: "2 ayda bir" },
          { value: "quarterly", label: "3 ayda bir" },
        ],
        hint: 'Yalnızca "Tekrarlansın" seçilirse uygulanır',
        essential: false,
      },
      f.notes(),
    ],
    reminders: [
      {
        type: "bill_due",
        fieldKey: "dueDate",
        titleTemplate: "Fatura son ödeme tarihi yaklaşıyor",
        bodyTemplate:
          "{{title}} için son ödeme tarihine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.billDue],
      },
    ],
  },

  insurance: {
    category: "insurance",
    label: "Sigorta / poliçe",
    description: "Poliçe bitişi ve yenileme takibi",
    examples: "Sağlık, DASK, konut, seyahat",
    icon: "shield-half-outline",
    titleLabel: "Poliçe adı",
    submitLabel: "Poliçeyi kaydet",
    successMessage: "Poliçe kaydedildi. Bitiş hatırlatması kuruldu.",
    defaultDocumentTypes: ["policy", "other"],
    fields: [
      {
        key: "title",
        label: "Poliçe adı",
        type: "text",
        required: true,
        topLevel: true,
        essential: true,
      },
      {
        key: "insuranceType",
        label: "Sigorta türü",
        type: "select",
        essential: true,
        options: [
          { value: "health", label: "Sağlık" },
          { value: "dask", label: "DASK" },
          { value: "home", label: "Konut" },
          { value: "travel", label: "Seyahat" },
          { value: "life", label: "Hayat" },
          { value: "other", label: "Diğer" },
        ],
      },
      f.brand("Sigorta şirketi"),
      {
        key: "policyNumber",
        label: "Poliçe no",
        type: "text",
        essential: true,
      },
      {
        key: "endDate",
        label: "Bitiş tarihi",
        type: "date",
        required: true,
        essential: true,
      },
      // Detaylı
      {
        key: "startDate",
        label: "Başlangıç tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "premium",
        label: "Prim tutarı (₺)",
        type: "currency",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "renewalDate",
        label: "Yenileme tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      f.notes(),
    ],
    reminders: [
      {
        type: "policy_end",
        fieldKey: "endDate",
        titleTemplate: "Poliçe bitiş tarihi yaklaşıyor",
        bodyTemplate:
          "{{title}} için poliçe bitişine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.policyEnd],
      },
      {
        type: "policy_end",
        fieldKey: "renewalDate",
        titleTemplate: "Poliçe yenileme tarihi yaklaşıyor",
        bodyTemplate:
          "{{title}} için poliçe yenilemesine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.policyRenewal],
      },
    ],
  },

  subscription: {
    category: "subscription",
    label: "Abonelik",
    description: "Yenileme ve taahhüt takibi",
    examples: "Netflix, Spotify, iCloud, Adobe",
    icon: "play-circle-outline",
    titleLabel: "Abonelik adı",
    submitLabel: "Aboneliği kaydet",
    successMessage: "Abonelik kaydedildi. Yenileme hatırlatması kuruldu.",
    defaultDocumentTypes: ["invoice", "other"],
    fields: [
      {
        key: "title",
        label: "Abonelik adı",
        type: "text",
        required: true,
        topLevel: true,
        essential: true,
        placeholder: "Örn. Netflix",
      },
      f.brand("Sağlayıcı"),
      {
        key: "renewalDate",
        label: "Yenileme / ödeme tarihi",
        type: "date",
        required: true,
        essential: true,
      },
      {
        key: "monthlyAmount",
        label: "Dönem tutarı (₺)",
        type: "currency",
        essential: true,
      },
      {
        key: "billingCycle",
        label: "Ödeme sıklığı",
        type: "select",
        essential: true,
        options: [
          { value: "monthly", label: "Her ay" },
          { value: "yearly", label: "Her yıl" },
          { value: "quarterly", label: "3 ayda bir" },
        ],
      },
      {
        key: "autoRenewal",
        label: "Otomatik yenileme var mı?",
        type: "boolean",
        essential: true,
      },
      // Detaylı
      {
        key: "packageName",
        label: "Paket adı",
        type: "text",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "startDate",
        label: "Başlangıç tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "commitmentEndDate",
        label: "Taahhüt bitiş tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "wantToCancel",
        label: "İptal etmek istiyor musun?",
        type: "boolean",
        essential: false,
      },
      f.notes(),
    ],
    reminders: [
      {
        type: "subscription_renewal",
        fieldKey: "renewalDate",
        titleTemplate: "Abonelik yenileme tarihi yaklaşıyor",
        bodyTemplate: "{{title}} için ödeme / yenileme tarihi yaklaşıyor.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.subscriptionRenewal],
      },
      {
        type: "commitment_end",
        fieldKey: "commitmentEndDate",
        titleTemplate: "Taahhüt bitiş tarihi yaklaşıyor",
        bodyTemplate: "{{title}} taahhüdü bitişine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.commitmentEnd],
      },
    ],
  },

  service: {
    category: "service",
    label: "Servis / bakım",
    description: "Servis kaydı ve takip tarihi",
    examples: "Kombi bakımı, klima bakımı, tamir",
    icon: "build-outline",
    titleLabel: "Servis adı",
    submitLabel: "Servis kaydını oluştur",
    successMessage: "Servis kaydı oluşturuldu. Takip hatırlatması kuruldu.",
    defaultDocumentTypes: ["service_form", "invoice", "other"],
    fields: [
      {
        key: "title",
        label: "Servis adı",
        type: "text",
        required: true,
        topLevel: true,
        essential: true,
      },
      f.brand("Servis firması"),
      {
        key: "serviceDate",
        label: "Servis tarihi",
        type: "date",
        essential: true,
      },
      {
        key: "serviceStatus",
        label: "Servis durumu",
        type: "select",
        essential: true,
        options: [
          { value: "open", label: "Açık" },
          { value: "pending", label: "Beklemede" },
          { value: "completed", label: "Tamamlandı" },
        ],
      },
      {
        key: "description",
        label: "Açıklama",
        type: "textarea",
        essential: true,
      },
      // Detaylı
      {
        key: "relatedItem",
        label: "Bağlı ürün/araç",
        type: "text",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "followUpDate",
        label: "Takip tarihi",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "amount",
        label: "Ücret (₺)",
        type: "currency",
        hint: "Opsiyonel",
        essential: false,
      },
      f.notes(),
    ],
    reminders: [
      {
        type: "service_follow_up",
        fieldKey: "followUpDate",
        titleTemplate: "Servis takip tarihi yaklaşıyor",
        bodyTemplate:
          "{{title}} için servis takibine {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.return],
      },
    ],
  },

  other: {
    category: "other",
    label: "Diğer",
    description: "Kategorisi olmayan kayıt ve hatırlatmalar",
    examples: "Önemli tarih, belge, hatırlatma",
    icon: "ellipsis-horizontal-outline",
    titleLabel: "Kayıt adı",
    submitLabel: "Kaydı oluştur",
    successMessage: "Kayıt oluşturuldu. Hatırlatma kuruldu.",
    defaultDocumentTypes: ["other"],
    fields: [
      {
        key: "title",
        label: "Kayıt adı",
        type: "text",
        required: true,
        topLevel: true,
        essential: true,
      },
      { key: "date", label: "Tarih", type: "date", essential: true },
      // Detaylı
      f.brand("Kurum / marka", false),
      {
        key: "deadline",
        label: "Son tarih",
        type: "date",
        hint: "Opsiyonel",
        essential: false,
      },
      {
        key: "amount",
        label: "Tutar (₺)",
        type: "currency",
        hint: "Opsiyonel",
        essential: false,
      },
      f.notes(),
    ],
    reminders: [
      {
        type: "generic_deadline",
        fieldKey: "deadline",
        titleTemplate: "Son tarih yaklaşıyor",
        bodyTemplate: "{{title}} için son tarihe {{daysBefore}} gün kaldı.",
        notifyBeforeDays: [...DEFAULT_NOTIFY_DAYS.genericDeadline],
      },
    ],
  },
};

export const CATEGORY_ORDER: ItemCategory[] = [
  "electronics",
  "vehicle",
  "home_bill",
  "subscription",
  "white_goods",
  "small_appliance",
  "furniture",
  "clothing",
  "insurance",
  "service",
  "other",
];

export function getCategory(c: ItemCategory): CategorySpec {
  return CATEGORIES[c];
}

export function categoryLabel(c: ItemCategory): string {
  return CATEGORIES[c]?.label ?? "Kayıt";
}

export function fillTemplate(
  template: string,
  vars: { title: string; daysBefore: number },
): string {
  return template
    .replace(/{{title}}/g, vars.title)
    .replace(/{{daysBefore}}/g, String(vars.daysBefore));
}
