import type { Product, ProductTone } from "@/types";

const byCategory: Record<string, ProductTone> = {
  "fruit-powder": "fruit",
  "leaf-powder": "leaf",
  "vegetable-powder": "vegetable",
  combos: "combo",
  tablet: "tablet",
  "dry-vegetable": "dry",
};
const byType: Record<Product["productType"], ProductTone> = { powder: "leaf", tablet: "tablet", dry: "dry", combo: "combo" };

/** Placeholder-art tone for a product; falls back gracefully for new categories. */
export const toneFor = (product: Pick<Product, "category" | "productType">): ProductTone =>
  byCategory[product.category] ?? byType[product.productType];
