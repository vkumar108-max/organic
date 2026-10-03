import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Product } from "@/types";

interface ProductSectionProps {
  id: string;
  title: string;
  description?: string;
  products: Product[];
  href: string;
  linkLabel: string;
  tinted?: boolean;
}

/** One reusable block for Best Sellers, Fruit, Leaf, Vegetable and Combos rows. */
export function ProductSection({ id, title, description, products, href, linkLabel, tinted }: ProductSectionProps) {
  if (products.length === 0) return null;
  return (
    <section aria-labelledby={id} className={`section ${tinted ? "bg-brand-50/70" : ""}`}>
      <div className="container-page">
        <SectionHeading id={id} title={title} description={description} href={href} linkLabel={linkLabel} />
        <ProductGrid products={products.slice(0, 4)} />
        <div className="mt-8 text-center sm:hidden">
          <a href={href} className="font-semibold text-brand-700 underline">{linkLabel}</a>
        </div>
      </div>
    </section>
  );
}
