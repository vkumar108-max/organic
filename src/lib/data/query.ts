import { pagination } from "@/config/site";
import { searchProducts } from "@/lib/search";
import type { Category, Product, ProductListResult, ProductQuery, ProductSort } from "@/types";

const sorters: Record<ProductSort, (a: Product, b: Product) => number> = {
  popular: (a, b) => b.popularity - a.popularity,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
};

/** Filtering + sorting + pagination over an in-memory list (demo adapter). */
export function runProductQuery(all: Product[], categories: Category[], query: ProductQuery = {}): ProductListResult {
  const active = all.filter((product) => product.status === "active");
  const scope = query.category ? active.filter((product) => product.category === query.category) : active;

  let items = query.q ? searchProducts(scope, categories, query.q) : [...scope];
  if (query.slugs) items = items.filter((product) => query.slugs!.includes(product.slug));
  if (query.minPrice !== undefined) items = items.filter((product) => product.price >= query.minPrice!);
  if (query.maxPrice !== undefined) items = items.filter((product) => product.price <= query.maxPrice!);
  if (query.inStock) items = items.filter((product) => product.stock > 0);
  if (query.minRating) items = items.filter((product) => product.rating >= query.minRating!);
  if (query.type) items = items.filter((product) => product.productType === query.type);
  if (query.size) items = items.filter((product) => product.variants.some((variant) => variant.label === query.size));
  if (query.featured) items = items.filter((product) => product.featured);
  if (query.bestSeller) items = items.filter((product) => product.bestSeller);
  if (query.newArrival) items = items.filter((product) => product.newArrival);

  // Keep search relevance order unless the shopper picked a sort explicitly.
  if (query.sort) items.sort(sorters[query.sort]);
  else if (!query.q) items.sort(sorters.popular);

  const pageSize = query.pageSize ?? pagination.shopPageSize;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);

  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    pageSize,
    totalPages,
    facets: {
      sizes: [...new Set(scope.flatMap((product) => product.variants.map((variant) => variant.label)))],
      types: [...new Set(scope.map((product) => product.productType))],
    },
  };
}
