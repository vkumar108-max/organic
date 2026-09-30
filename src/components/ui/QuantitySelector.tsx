"use client";

import { Icon } from "./Icon";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md";
}

export function QuantitySelector({ value, onChange, min = 1, max = 20, label = "Quantity", size = "md" }: QuantitySelectorProps) {
  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-full border border-line bg-white">
      <button
        type="button"
        className={`${dim} grid place-items-center rounded-full text-ink hover:bg-brand-50 disabled:opacity-40`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
      >
        <Icon name="minus" size={16} />
      </button>
      <output aria-live="polite" className="min-w-8 text-center text-sm font-semibold tabular-nums">
        {value}
      </output>
      <button
        type="button"
        className={`${dim} grid place-items-center rounded-full text-ink hover:bg-brand-50 disabled:opacity-40`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}
