"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { priceBuckets, typeLabels } from "@/lib/catalog-params";
import type { Category, ProductType } from "@/types";

interface FilterSidebarProps {
  categories?: Category[];
  facets: { sizes: string[]; types: ProductType[] };
  /** Hide the category group on category pages */
  showCategories?: boolean;
  resultCount: number;
}

/** Filters live in the URL. Desktop: sticky sidebar. Mobile: slide-in drawer. */
export function FilterSidebar(props: FilterSidebarProps) {
  const [open, setOpen] = useState(false);
  const params = useSearchParams();
  const activeCount = ["category", "minPrice", "maxPrice", "inStock", "rating", "type", "size"].filter((key) => params.has(key)).length;

  return (
    <>
      <div className="lg:hidden">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} aria-haspopup="dialog">
          <Icon name="filter" size={16} /> Filters{activeCount > 0 && ` (${activeCount})`}
        </Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Filters" variant="drawer">
          <FilterForm {...props} onApplied={() => setOpen(false)} />
          <div className="sticky bottom-0 -mx-5 mt-4 border-t border-line bg-white p-4">
            <Button full onClick={() => setOpen(false)}>Show {props.resultCount} products</Button>
          </div>
        </Modal>
      </div>
      <aside aria-label="Product filters" className="hidden lg:sticky lg:top-40 lg:block lg:self-start">
        <FilterForm {...props} />
      </aside>
    </>
  );
}

function FilterForm({ categories, facets, showCategories = true }: FilterSidebarProps & { onApplied?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined) next.delete(key);
      else next.set(key, value);
    }
    next.delete("page");
    const text = next.toString();
    router.push(text ? `${pathname}?${text}` : pathname, { scroll: false });
  };

  const currentMin = params.get("minPrice") ?? undefined;
  const currentMax = params.get("maxPrice") ?? undefined;
  const hasFilters = ["category", "minPrice", "maxPrice", "inStock", "rating", "type", "size"].some((key) => params.has(key));
  const group = "border-b border-line py-4 last:border-0";
  const legend = "mb-2 text-sm font-bold uppercase tracking-wide text-ink";
  const option = "flex min-h-8 cursor-pointer items-center gap-2.5 text-sm";
  const box = "h-4 w-4 accent-brand-600";

  return (
    <form onSubmit={(event) => event.preventDefault()} className="rounded-card lg:border lg:border-line lg:p-5">
      <div className="flex items-center justify-between">
        <h2 className="hidden font-sans text-lg font-semibold lg:block">Filters</h2>
        {hasFilters && (
          <Link href={pathname} scroll={false} className="text-sm font-semibold text-brand-700 hover:underline">Clear all</Link>
        )}
      </div>

      {showCategories && categories && (
        <fieldset className={group}>
          <legend className={legend}>Category</legend>
          {categories.map((category) => (
            <label key={category.id} className={option}>
              <input type="radio" name="category" className={box} checked={params.get("category") === category.slug} onChange={() => update({ category: category.slug })} />
              {category.name}
            </label>
          ))}
          {params.has("category") && <button type="button" className="mt-1 text-xs text-brand-700 underline" onClick={() => update({ category: undefined })}>All categories</button>}
        </fieldset>
      )}

      <fieldset className={group}>
        <legend className={legend}>Price</legend>
        {priceBuckets.map((bucket) => {
          const checked = currentMin === (bucket.min?.toString() ?? undefined) && currentMax === (bucket.max?.toString() ?? undefined);
          return (
            <label key={bucket.label} className={option}>
              <input type="radio" name="price" className={box} checked={checked} onChange={() => update({ minPrice: bucket.min?.toString(), maxPrice: bucket.max?.toString() })} />
              {bucket.label}
            </label>
          );
        })}
      </fieldset>

      <fieldset className={group}>
        <legend className={legend}>Availability</legend>
        <label className={option}>
          <input type="checkbox" className={box} checked={params.get("inStock") === "1"} onChange={(event) => update({ inStock: event.target.checked ? "1" : undefined })} />
          In stock only
        </label>
      </fieldset>

      <fieldset className={group}>
        <legend className={legend}>Rating</legend>
        {[4, 3].map((stars) => (
          <label key={stars} className={option}>
            <input type="radio" name="rating" className={box} checked={params.get("rating") === String(stars)} onChange={() => update({ rating: String(stars) })} />
            {stars}★ &amp; above
          </label>
        ))}
      </fieldset>

      {facets.types.length > 1 && (
        <fieldset className={group}>
          <legend className={legend}>Product type</legend>
          {facets.types.map((type) => (
            <label key={type} className={option}>
              <input type="radio" name="type" className={box} checked={params.get("type") === type} onChange={() => update({ type })} />
              {typeLabels[type]}
            </label>
          ))}
        </fieldset>
      )}

      {facets.sizes.length > 1 && (
        <fieldset className={group}>
          <legend className={legend}>Size / weight</legend>
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={params.get("size") === size}
                onClick={() => update({ size: params.get("size") === size ? undefined : size })}
                className={`rounded-full border px-3 py-1 text-sm ${params.get("size") === size ? "border-brand-600 bg-brand-50 font-semibold text-brand-800" : "border-line hover:border-brand-300"}`}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </form>
  );
}
