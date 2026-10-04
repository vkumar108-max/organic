import { Icon } from "./Icon";

/** Read-only star rating. Announces "4.5 out of 5" to screen readers. */
export function Rating({ value, count, size = 14, showValue = false }: { value: number; count?: number; size?: number; showValue?: boolean }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
      <span className="sr-only">{`Rated ${value.toFixed(1)} out of 5`}</span>
      <span className="inline-flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="relative inline-block" style={{ width: size, height: size }}>
            <Icon name="star" size={size} className="absolute inset-0 text-line" filled />
            <span className="absolute inset-0 overflow-hidden" style={{ width: rounded >= star ? "100%" : rounded >= star - 0.5 ? "50%" : "0%" }}>
              <Icon name="star" size={size} className="text-turmeric-500" filled />
            </span>
          </span>
        ))}
      </span>
      {showValue && <span className="font-medium text-ink">{value.toFixed(1)}</span>}
      {count !== undefined && <span aria-hidden="true">({count})</span>}
    </span>
  );
}

/** Interactive star picker used in the review form. */
export function StarPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Your rating" className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          className="p-1 text-line hover:text-turmeric-500 data-[on=true]:text-turmeric-500"
          data-on={star <= value}
        >
          <Icon name="star" size={26} filled />
        </button>
      ))}
    </div>
  );
}
