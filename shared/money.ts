/** Turkish money input: dots group liras, comma separates kuruş. */
export function formatMoneyInput(value: string | number): string {
  if (typeof value === "number")
    return value.toLocaleString("tr-TR", {
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2,
    });
  const raw = value.replace(/\s|₺/g, "");
  if (!raw) return "";
  if (!/^[\d.,]+$/.test(raw)) return raw;
  const [whole, fraction, ...extra] = raw.split(",");
  if (extra.length || (fraction?.length ?? 0) > 2) return raw;
  const digits = whole.replace(/\./g, "").replace(/^0+(?=\d)/, "") || "0";
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return grouped + (fraction !== undefined ? "," + fraction : "");
}
