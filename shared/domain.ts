import { CATEGORIES } from './categories';
import { addMonthsIso, daysUntil, todayIso } from './date-utils';
import type { AldimItem, Reminder, AppSettings } from './types';

export const DEFAULT_SETTINGS: AppSettings = { notificationsEnabled: true, onboardingComplete: true, emailEnabled: true, smsEnabled: false, phone: '' };
export const DOCUMENT_LABELS = { invoice: 'Fatura', warranty: 'Garanti belgesi', service_form: 'Servis formu', shipping_receipt: 'Kargo fişi', policy: 'Poliçe', registration: 'Ruhsat', inspection: 'Muayene belgesi', return_request: 'İade talebi', bill: 'Ödeme faturası', other: 'Diğer' };
export const isDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
export function parseAmount(value: string): number {
  const normalized = value.trim().replace(/\s/g, '').replace(/₺/g, '');
  const number = Number(normalized.includes(',') ? normalized.replace(/\./g, '').replace(',', '.') : normalized);
  if (!normalized || !Number.isFinite(number) || number < 0) throw new Error('Geçerli, pozitif bir tutar gir. Örnek: 1.250,50');
  return Math.round(number * 100) / 100;
}
export function validateItem(item: Pick<AldimItem, 'title' | 'category' | 'price' | 'purchaseDate' | 'fields'>) {
  if (!item.title.trim()) throw new Error('Kayıt adı gerekli.');
  if (!(item.category in CATEGORIES)) throw new Error('Geçersiz kategori.');
  if (item.price !== undefined && (!Number.isFinite(item.price) || item.price < 0)) throw new Error('Tutar sıfır veya daha büyük olmalı.');
  for (const f of CATEGORIES[item.category].fields) {
    const value = f.key === 'purchaseDate' ? item.purchaseDate : item.fields[f.key];
    if (f.type === 'date' && value && (typeof value !== 'string' || !isDate(value))) throw new Error(`${f.label}: geçerli bir tarih gir.`);
  }
}
export function buildReminders(item: AldimItem, previous: Reminder[] = [], uuid: () => string = () => crypto.randomUUID()): Reminder[] {
  if (item.status === 'archived') return [];
  const now = new Date().toISOString();
  const specs = [...CATEGORIES[item.category].reminders];
  for (const record of item.serviceRecords) {
    if (record.nextFollowUpDate && record.status !== 'resolved') specs.push({ type: 'service_follow_up', fieldKey: `service:${record.id}`, titleTemplate: `${record.company} · Servis takibi`, bodyTemplate: '', notifyBeforeDays: [7, 1] });
  }
  return specs.flatMap(spec => {
    const value = spec.fieldKey.startsWith('service:') ? item.serviceRecords.find(s => s.id === spec.fieldKey.slice(8))?.nextFollowUpDate : spec.fieldKey === 'purchaseDate' ? item.purchaseDate : item.fields[spec.fieldKey];
    if (typeof value !== 'string' || !isDate(value)) return [];
    const old = previous.find(r => r.itemId === item.id && r.sourceField === spec.fieldKey && r.dueDate === value);
    return [{ id: old?.id ?? uuid(), userId: item.userId, title: spec.titleTemplate, type: spec.type, itemId: item.id, itemTitle: item.title, itemCategory: item.category, sourceField: spec.fieldKey, dueDate: value, notifyBeforeDays: [...new Set([...spec.notifyBeforeDays, 0])], notificationIds: old?.notificationIds ?? [], status: old?.status === 'completed' ? 'completed' : 'active', createdAt: old?.createdAt ?? now, updatedAt: now } satisfies Reminder];
  });
}
export function nextPaymentDate(item: AldimItem, dueDate: string): string | null {
  const cycle = item.fields.billingCycle;
  if (item.category === 'subscription') return addMonthsIso(dueDate, cycle === 'yearly' ? 12 : cycle === 'quarterly' ? 3 : 1);
  if (item.category === 'home_bill' && item.fields.recurring === true) return addMonthsIso(dueDate, item.fields.recurrencePeriod === 'bimonthly' ? 2 : item.fields.recurrencePeriod === 'quarterly' ? 3 : 1);
  return null;
}
export const itemAmount = (item: AldimItem): number => Number(item.category === 'subscription' ? item.fields.monthlyAmount ?? item.price ?? 0 : item.fields.amount ?? item.price ?? 0);
export function spendingSummary(items: AldimItem[], payments: Payment[] = [], month = todayIso().slice(0, 7)) {
  const active = items.filter(i => i.status === 'active');
  return {
    total: items.filter(i => !['subscription','home_bill'].includes(i.category)).reduce((n,i) => n + (i.price ?? 0), 0) + payments.reduce((n,p) => n + p.amount, 0),
    thisMonth: items.filter(i => !['subscription','home_bill'].includes(i.category) && i.purchaseDate?.startsWith(month)).reduce((n,i) => n + (i.price ?? 0), 0) + payments.filter(p => p.paidAt.startsWith(month)).reduce((n,p) => n + p.amount, 0),
    subscriptions: active.filter(i => i.category === 'subscription').reduce((n,i) => n + itemAmount(i) / (i.fields.billingCycle === 'yearly' ? 12 : i.fields.billingCycle === 'quarterly' ? 3 : 1), 0),
    documents: items.reduce((n,i) => n + i.documents.length, 0),
    warranties: active.filter(i => typeof i.fields.warrantyEndDate === 'string' && daysUntil(i.fields.warrantyEndDate) >= 0).length,
  };
}
export interface Payment { id: string; itemId: string; itemTitle: string; amount: number; paidAt: string; dueDate: string; }
