const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** YYYY-MM-DD string'ini local timezone'da bir Date'e çevirir. */
function parseIsoToLocalDate(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  return new Date(iso);
}

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function toIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** Pozitif: kaç gün kaldı. Negatif: kaç gün önce geçti. */
export function daysUntil(iso: string, now: Date = new Date()): number {
  const target = startOfLocalDay(parseIsoToLocalDate(iso));
  const today = startOfLocalDay(now);
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
}

export function isPast(iso: string, now: Date = new Date()): boolean {
  return daysUntil(iso, now) < 0;
}

export function humanizeDaysLeft(iso: string, now: Date = new Date()): string {
  const d = daysUntil(iso, now);
  if (d === 0) return "Bugün";
  if (d === 1) return "Yarın";
  if (d > 1) return `${d} gün kaldı`;
  if (d === -1) return "Dün geçti";
  return `${Math.abs(d)} gün önce geçti`;
}

export function addDaysIso(iso: string, days: number): string {
  const d = parseIsoToLocalDate(iso);
  d.setDate(d.getDate() + days);
  return toIsoLocal(d);
}

export function addMonthsIso(iso: string, months: number): string {
  const d = parseIsoToLocalDate(iso);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return toIsoLocal(d);
}

export function todayIso(): string {
  return toIsoLocal(new Date());
}

/** YYYY-MM-DD + saat → Date (local). Bildirim trigger'ları için kullanılır. */
export function isoToDateAt(iso: string, hour = 10, minute = 0): Date {
  const d = parseIsoToLocalDate(iso);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const MONTHS_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

export function formatDateTR(iso?: string | null): string {
  if (!iso) return "—";
  const d = parseIsoToLocalDate(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatCurrencyTRY(value: number): string {
  return `${value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;
}
