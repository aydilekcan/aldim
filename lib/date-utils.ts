const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** YYYY-MM-DD string'ini local timezone'da bir Date'e çevirir. */
function parseIsoToLocalDate(iso: string): Date {
  // Sadece tarih ise (YYYY-MM-DD) lokal olarak parse et — JS'in default
  // davranışı UTC midnight olarak yorumlamaktır, bu da TR'de bir gün kaymaya
  // sebep olabilir.
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

export function daysBetween(fromIso: string, toIso: string): number {
  const from = startOfLocalDay(parseIsoToLocalDate(fromIso));
  const to = startOfLocalDay(parseIsoToLocalDate(toIso));
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
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
  if (d === 1) return "1 gün kaldı";
  if (d > 1) return `${d} gün kaldı`;
  if (d === -1) return "1 gün önce geçti";
  return `${Math.abs(d)} gün önce geçti`;
}

export function addYearsIso(iso: string, years: number): string {
  const d = parseIsoToLocalDate(iso);
  d.setFullYear(d.getFullYear() + years);
  return toIsoLocal(d);
}

export function addMonthsIso(iso: string, months: number): string {
  const d = parseIsoToLocalDate(iso);
  d.setMonth(d.getMonth() + months);
  return toIsoLocal(d);
}

export function addDaysIso(iso: string, days: number): string {
  const d = parseIsoToLocalDate(iso);
  d.setDate(d.getDate() + days);
  return toIsoLocal(d);
}

/** Lokal güne göre bugünün YYYY-MM-DD değerini döner. */
export function todayIso(): string {
  return toIsoLocal(new Date());
}
