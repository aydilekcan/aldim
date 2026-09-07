"use client";
import { useRef } from "react";
import { parseAmount } from "@/shared/domain";
import { formatMoneyInput } from "@/shared/money";
export function CurrencyInput({
  value,
  onChange,
  required,
}: {
  value: string | number;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <span className="currency-input">
      <input
        ref={input}
        value={formatMoneyInput(value)}
        inputMode="decimal"
        type="text"
        required={required}
        placeholder="0"
        onPaste={(event) => {
          const field = event.currentTarget;
          if (
            field.value &&
            !(
              field.selectionStart === 0 &&
              field.selectionEnd === field.value.length
            )
          )
            return;
          try {
            const value = parseAmount(event.clipboardData.getData("text"));
            event.preventDefault();
            onChange(formatMoneyInput(value));
          } catch {
            /* Keep invalid input visible for validation. */
          }
        }}
        onChange={(event) => {
          const field = event.target;
          const count = field.value
            .slice(0, field.selectionStart ?? field.value.length)
            .replace(/\./g, "").length;
          const next = formatMoneyInput(field.value);
          onChange(next);
          requestAnimationFrame(() => {
            if (document.activeElement !== input.current) return;
            let pos = 0,
              seen = 0;
            while (pos < next.length && seen < count) {
              if (next[pos] !== ".") seen++;
              pos++;
            }
            input.current?.setSelectionRange(pos, pos);
          });
        }}
      />
      <span className="currency-unit" aria-hidden="true">
        ₺
      </span>
    </span>
  );
}
