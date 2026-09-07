import test from "node:test";
import assert from "node:assert/strict";
import { addMonthsIso, daysUntil } from "../shared/date-utils";
import {
  buildReminders,
  isDate,
  parseAmount,
  nextPaymentDate,
  spendingSummary,
  validateItem,
} from "../shared/domain";
import { convertLegacy } from "../shared/legacy";
import type { AldimItem } from "../shared/types";
const item = (patch: Partial<AldimItem> = {}): AldimItem => ({
  id: "1",
  userId: "u",
  category: "electronics",
  title: "Telefon",
  fields: {},
  documents: [],
  serviceRecords: [],
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...patch,
});
test("month-end renewal clamps to calendar month, including leap years", () => {
  assert.equal(addMonthsIso("2026-01-31", 1), "2026-02-28");
  assert.equal(addMonthsIso("2024-01-31", 1), "2024-02-29");
  assert.equal(addMonthsIso("2024-02-29", 12), "2025-02-28");
});
test("dates reject rollover dates and invalid user input", () => {
  assert.equal(isDate("2026-02-30"), false);
  assert.equal(isDate("2024-02-29"), true);
  assert.equal(isDate("garbage"), false);
  assert.throws(() =>
    validateItem(item({ fields: { warrantyEndDate: "2026-02-31" } })),
  );
});
test("Turkish currency retains cents and rejects malformed amounts", () => {
  assert.equal(parseAmount("1.250,50"), 1250.5);
  assert.equal(parseAmount("1250.50"), 1250.5);
  assert.equal(parseAmount("0"), 0);
  for (const value of ["-1", "abc", "", "1,2,3"])
    assert.throws(() => parseAmount(value));
});
test("reminder IDs and completed state survive unrelated edits", () => {
  const original = item({ fields: { warrantyEndDate: "2026-12-01" } });
  const first = buildReminders(original, [], () => "stable");
  const completed = first.map((r) => ({ ...r, status: "completed" as const }));
  const next = buildReminders({ ...original, title: "Yeni ad" }, completed);
  assert.equal(next[0].id, "stable");
  assert.equal(next[0].status, "completed");
  assert.equal(next[0].itemTitle, "Yeni ad");
  assert.ok(next[0].notifyBeforeDays.includes(0));
});
test("changed dates create fresh reminders; archived records do not notify", () => {
  const first = buildReminders(
    item({ fields: { warrantyEndDate: "2026-12-01" } }),
    [],
    () => "old",
  );
  const next = buildReminders(
    item({ fields: { warrantyEndDate: "2027-01-01" } }),
    first,
    () => "new",
  );
  assert.equal(next[0].id, "new");
  assert.equal(
    buildReminders(
      item({ status: "archived", fields: { warrantyEndDate: "2026-12-01" } }),
    ).length,
    0,
  );
});
test("service follow-up stops after service resolution", () => {
  const r = {
    id: "s",
    itemId: "1",
    date: "2026-01-01",
    company: "Yetkili servis",
    description: "Onarım",
    status: "open" as const,
    nextFollowUpDate: "2026-10-01",
  };
  assert.equal(buildReminders(item({ serviceRecords: [r] })).length, 1);
  assert.equal(
    buildReminders(item({ serviceRecords: [{ ...r, status: "resolved" }] }))
      .length,
    0,
  );
});
test("spending never counts an unpaid bill as a completed expense", () => {
  const records = [
    item({ price: 100, purchaseDate: "2026-09-01" }),
    item({
      id: "b",
      category: "home_bill",
      fields: { amount: 200, dueDate: "2026-09-10" },
    }),
    item({
      id: "s",
      category: "subscription",
      fields: { monthlyAmount: 1200, billingCycle: "yearly" },
    }),
  ];
  const sum = spendingSummary(
    records,
    [
      {
        id: "p",
        itemId: "b",
        itemTitle: "Su",
        amount: 50,
        paidAt: "2026-09-02",
        dueDate: "2026-09-02",
      },
    ],
    "2026-09",
  );
  assert.equal(sum.thisMonth, 150);
  assert.equal(sum.subscriptions, 100);
  assert.equal(sum.total, 150);
});
test("recurring bills are explicit; annual subscriptions advance one year", () => {
  assert.equal(
    nextPaymentDate(item({ category: "home_bill" }), "2026-01-31"),
    null,
  );
  assert.equal(
    nextPaymentDate(
      item({ category: "home_bill", fields: { recurring: true } }),
      "2026-01-31",
    ),
    "2026-02-28",
  );
  assert.equal(
    nextPaymentDate(
      item({ category: "subscription", fields: { billingCycle: "yearly" } }),
      "2026-01-01",
    ),
    "2027-01-01",
  );
});
test("legacy import preserves documents, service and return data and isolates owners", () => {
  const raw = {
    products: [
      {
        id: "p_1",
        name: "TV",
        price: 100,
        documents: [{ id: "d1", name: "Fatura", type: "invoice" }],
        serviceRecords: [
          {
            id: "s1",
            company: "Servis",
            description: "Ekran",
            date: "2026-01-01",
          },
        ],
        returnProcess: { reason: "Arızalı" },
      },
    ],
  };
  const a = convertLegacy(raw, "user-a")[0],
    b = convertLegacy(raw, "user-b")[0];
  assert.notEqual(a.id, b.id);
  assert.equal(convertLegacy(raw, "user-a")[0].id, a.id);
  assert.equal(a.documents.length, 1);
  assert.equal(a.serviceRecords.length, 1);
  assert.match(a.notes!, /Arızalı/);
  assert.equal(
    convertLegacy(
      { items: [{ id: "x", title: "Private", userId: "other" }] },
      "user-a",
    ).length,
    0,
  );
});
test("calendar day difference is stable around daylight savings", () => {
  assert.equal(daysUntil("2026-03-30", new Date(2026, 2, 29)), 1);
});

test("bill recurrence honors two and three month periods", () => {
  assert.equal(
    nextPaymentDate(
      item({
        category: "home_bill",
        fields: { recurring: true, recurrencePeriod: "bimonthly" },
      }),
      "2026-01-31",
    ),
    "2026-03-31",
  );
  assert.equal(
    nextPaymentDate(
      item({
        category: "home_bill",
        fields: { recurring: true, recurrencePeriod: "quarterly" },
      }),
      "2026-01-31",
    ),
    "2026-04-30",
  );
});
