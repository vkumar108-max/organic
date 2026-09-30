import { cn, discountPercent, formatPrice } from "@/lib/format";

interface PriceDisplayProps {
  price: number;
  mrp?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showBadge?: boolean;
}

export function PriceDisplay({ price, mrp, size = "md", className, showBadge = true }: PriceDisplayProps) {
  const discount = mrp ? discountPercent(price, mrp) : 0;
  const priceSize = { sm: "text-base", md: "text-lg", lg: "text-3xl" }[size];
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-bold text-ink", priceSize)}>{formatPrice(price)}</span>
      {mrp && discount > 0 && (
        <>
          <span className={cn("text-ink-soft line-through", size === "lg" ? "text-lg" : "text-sm")}>
            <span className="sr-only">MRP </span>
            {formatPrice(mrp)}
          </span>
          {showBadge && (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">{discount}% OFF</span>
          )}
        </>
      )}
    </div>
  );
}
