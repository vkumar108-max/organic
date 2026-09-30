import { cn } from "@/lib/format";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  /** Columns at the widest layout */
  columns?: 3 | 4;
  className?: string;
}

/** 2 columns on phones, growing with the viewport; no fixed widths anywhere. */
export function ProductGrid({ products, columns = 4, className }: ProductGridProps) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3", columns === 4 && "xl:grid-cols-4", className)}>
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard product={product} priority={index < 2} />
        </li>
      ))}
    </ul>
  );
}
