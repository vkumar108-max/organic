import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductGrid } from "@/components/product/ProductGrid";
import { withParams, type SearchParams } from "@/lib/catalog-params";
import type { Category, ProductListResult, ProductSort } from "@/types";
import { FilterSidebar } from "./FilterSidebar";
import { SortDropdown } from "./SortDropdown";

interface CatalogViewProps {
  result: ProductListResult;
  basePath: string;
  searchParams: SearchParams;
  categories?: Category[];
  showCategoryFilter?: boolean;
  sort?: ProductSort;
  /** Shown as the results heading suffix */
  noun?: string;
}

/** Filters + sort + grid + pagination shared by Shop, Category and Search pages. */
export function CatalogView({ result, basePath, searchParams, categories, showCategoryFilter = true, sort, noun = "products" }: CatalogViewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:gap-10">
      <FilterSidebar categories={categories} facets={result.facets} showCategories={showCategoryFilter} resultCount={result.total} />
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft" role="status">
            <span className="font-semibold text-ink">{result.total}</span> {result.total === 1 ? noun.replace(/s$/, "") : noun}
          </p>
          <SortDropdown current={sort} />
        </div>
        {result.items.length > 0 ? (
          <>
            <ProductGrid products={result.items} columns={3} />
            <Pagination page={result.page} totalPages={result.totalPages} hrefFor={(page) => withParams(basePath, searchParams, { page })} />
          </>
        ) : (
          <EmptyState icon="search" title="No products match these filters" description="Try removing a filter or browsing all products." action={{ label: "Clear filters", href: basePath }} />
        )}
      </div>
    </div>
  );
}
