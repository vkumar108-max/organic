import type { Category, Product } from "@/types";

/**
 * Lightweight relevance scoring over name, category, subcategory and keywords.
 * Deliberately dependency-free; swap for the backend's search endpoint (e.g.
 * Meilisearch/Algolia) when the catalogue grows — the repository interface
 * already exposes `q` so the UI does not change.
 */
const normalise = (text: string) => text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

export function scoreProduct(product: Product, categoryName: string, query: string): number {
  const tokens = normalise(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return 0;
  const name = normalise(product.name);
  const category = normalise(categoryName);
  const sub = normalise(product.subcategory ?? "");
  const keywords = product.keywords.map(normalise);
  let total = 0;
  for (const token of tokens) {
    let best = 0;
    if (name === token) best = 100;
    else if (name.split(" ").some((word) => word === token)) best = 60;
    else if (name.includes(token)) best = 45;
    if (keywords.some((keyword) => keyword === token)) best = Math.max(best, 50);
    else if (keywords.some((keyword) => keyword.includes(token))) best = Math.max(best, 30);
    if (category.includes(token)) best = Math.max(best, 20);
    if (sub.includes(token)) best = Math.max(best, 15);
    if (normalise(product.shortDescription).includes(token)) best = Math.max(best, 8);
    if (best === 0) return 0; // every token must match something
    total += best;
  }
  return total + product.popularity / 100;
}

export function searchProducts(products: Product[], categories: Category[], query: string) {
  const names = new Map(categories.map((category) => [category.slug, category.name]));
  return products
    .map((product) => ({ product, score: scoreProduct(product, names.get(product.category) ?? "", query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.product);
}

export function searchCategories(categories: Category[], query: string) {
  const q = normalise(query);
  if (!q) return [];
  return categories.filter((category) => normalise(category.name).includes(q) || normalise(category.slug).includes(q));
}
