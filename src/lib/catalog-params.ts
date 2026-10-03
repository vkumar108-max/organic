import type { ProductQuery, ProductSort, ProductType } from "@/types";

export type SearchParams = Record<string, string | string[] | undefined>;

const sorts: ProductSort[] = ["popular", "newest", "price-asc", "price-desc", "rating"];
const types: ProductType[] = ["powder", "tablet", "dry", "combo"];

export const sortLabels: Record<ProductSort, string> = {
  popular: "Popular",
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Rating",
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const num = (value: string | undefined) => {
  const parsed = Number(value);
  return value !== undefined && value !== "" && Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

/** URL is the single source of truth for filters → shareable, crawlable, back-button friendly. */
export function parseCatalogParams(params: SearchParams): ProductQuery {
  const sort = first(params.sort) as ProductSort | undefined;
  const type = first(params.type) as ProductType | undefined;
  return {
    q: first(params.q)?.slice(0, 80) || undefined,
    category: first(params.category) || undefined,
    minPrice: num(first(params.minPrice)),
    maxPrice: num(first(params.maxPrice)),
    inStock: first(params.inStock) === "1" || undefined,
    minRating: num(first(params.rating)),
    type: type && types.includes(type) ? type : undefined,
    size: first(params.size) || undefined,
    sort: sort && sorts.includes(sort) ? sort : undefined,
    page: Math.max(1, Math.floor(num(first(params.page)) ?? 1)),
  };
}

/** Rebuild a query string from the raw params, overriding some keys. */
export function withParams(base: string, params: SearchParams, overrides: Record<string, string | number | undefined>) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const single = first(value);
    if (single) next.set(key, single);
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined || value === "" || (key === "page" && value === 1)) next.delete(key);
    else next.set(key, String(value));
  }
  const text = next.toString();
  return text ? `${base}?${text}` : base;
}

export const priceBuckets = [
  { label: "Under ₹200", min: undefined, max: 199 },
  { label: "₹200 – ₹500", min: 200, max: 500 },
  { label: "₹500 – ₹1,000", min: 501, max: 1000 },
  { label: "Over ₹1,000", min: 1001, max: undefined },
] as const;

export const typeLabels: Record<ProductType, string> = { powder: "Powder", tablet: "Tablet", dry: "Dry vegetable", combo: "Combo pack" };
