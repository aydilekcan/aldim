import test from "node:test";
import assert from "node:assert/strict";
import { formatMoneyInput } from "../shared/money";
import { parseAmount, validateItem } from "../shared/domain";
import { formatCurrencyTRY, todayIso, addDaysIso } from "../shared/date-utils";
test("money fields group while typing without changing the stored amount", () => {
  let value = "";
  for (const char of "235000") value = formatMoneyInput(value + char);
  assert.equal(value, "235.000");
  assert.equal(parseAmount(value), 235000);
  value = formatMoneyInput(value + ",50");
  assert.equal(value, "235.000,50");
  assert.equal(parseAmount(value), 235000.5);
  assert.equal(formatMoneyInput("235.00"), "23.500");
  assert.equal(formatMoneyInput(""), "");
  for (const amount of [0, 1, 1250, 235000, 12500000, 0.01, 235000.5])
    assert.equal(parseAmount(formatMoneyInput(amount)), amount);
});
test("currency output omits empty kuruş and keeps nonzero cents", () => {
  assert.equal(formatCurrencyTRY(235000), "235.000 ₺");
  assert.equal(formatCurrencyTRY(235000.5), "235.000,50 ₺");
  assert.equal(parseAmount("1250.50"), 1250.5);
  for (const value of ["1e3", "12.34.56", "-100", "12,345"])
    assert.throws(() => parseAmount(value));
});
test("future purchase dates are rejected but future warranties are allowed", () => {
  const base = {
    title: "Telefon",
    category: "electronics" as const,
    fields: { warrantyEndDate: addDaysIso(todayIso(), 365) },
  };
  assert.doesNotThrow(() =>
    validateItem({ ...base, purchaseDate: todayIso() }),
  );
  assert.throws(
    () => validateItem({ ...base, purchaseDate: addDaysIso(todayIso(), 1) }),
    /bugünden sonra/,
  );
});
