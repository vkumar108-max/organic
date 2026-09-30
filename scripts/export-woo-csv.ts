/**
 * Exports the demo catalogue (src/data/demo) to WooCommerce's standard product CSV
 * plus category/date helpers, so the WordPress theme can be tried with sample
 * products via WooCommerce's own importer.
 *
 *   node --experimental-strip-types scripts/export-woo-csv.ts
 */
import { writeFileSync } from "node:fs";
import { demoCategories } from "../src/data/demo/categories.ts";
import { demoProducts } from "../src/data/demo/products.ts";

const catName = new Map(demoCategories.map((category) => [category.slug, category.name]));
const typeLabel: Record<string, string> = { powder: "Powder", tablet: "Tablet", dry: "Dry vegetable", combo: "Combo pack" };

const headers = [
  "Type", "SKU", "Name", "Published", "Is featured?", "Visibility in catalog", "Short description", "Description",
  "In stock?", "Stock", "Regular price", "Sale price", "Categories", "Tags", "Images", "Parent",
  "Attribute 1 name", "Attribute 1 value(s)", "Attribute 1 visible", "Attribute 1 global", "Attribute 1 default",
  "Attribute 2 name", "Attribute 2 value(s)", "Attribute 2 visible", "Attribute 2 global",
  "Meta: _vr_highlights", "Meta: _vr_storage",
];

const cell = (value: unknown) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const row = (record: Record<string, unknown>) => headers.map((header) => cell(record[header])).join(",");

const dates: Record<string, number> = {};

interface Options { published: number; skipCombos: boolean; categoryNames: Record<string, string>; tags: string[] }

function build({ published, skipCombos, categoryNames, tags: extraTags }: Options): string[] {
const rows: string[] = [headers.join(",")];
const NOW = Date.UTC(2026, 8, 1);

for (const product of demoProducts) {
  if (skipCombos && product.category === "combos") continue;
  const tags = [...extraTags, ...(product.bestSeller ? ["best-seller"] : [])].join(", ");
  const base = {
    Published: published,
    "Is featured?": product.featured ? 1 : 0,
    "Visibility in catalog": "visible",
    "Short description": product.shortDescription,
    Description: product.description,
    Categories: categoryNames[catName.get(product.category)!] ?? catName.get(product.category),
    Tags: tags,
    "Attribute 2 name": "Product type",
    "Attribute 2 value(s)": typeLabel[product.productType],
    "Attribute 2 visible": 1,
    "Attribute 2 global": 1,
    "Meta: _vr_highlights": product.highlights.join("\n"),
    "Meta: _vr_storage": product.storage ?? "",
  };
  dates[product.sku] = Math.round((NOW - Date.parse(product.createdAt)) / 86_400_000);

  if (product.variants.length === 1) {
    const [variant] = product.variants;
    rows.push(row({ ...base, Type: "simple", SKU: product.sku, Name: product.name, "In stock?": variant.stock > 0 ? 1 : 0, Stock: variant.stock, "Regular price": variant.mrp, "Sale price": variant.price }));
    continue;
  }
  rows.push(row({
    ...base, Type: "variable", SKU: product.sku, Name: product.name, "In stock?": 1,
    "Attribute 1 name": "Size", "Attribute 1 value(s)": product.variants.map((variant) => variant.label).join(", "),
    "Attribute 1 visible": 1, "Attribute 1 global": 1, "Attribute 1 default": product.variants[0].label,
  }));
  for (const variant of product.variants) {
    rows.push(row({
      Type: "variation", SKU: variant.sku, Name: `${product.name} - ${variant.label}`, Published: 1, "Visibility in catalog": "visible", "In stock?": variant.stock > 0 ? 1 : 0, Stock: variant.stock,
      "Regular price": variant.mrp, "Sale price": variant.price, Parent: product.sku,
      "Attribute 1 name": "Size", "Attribute 1 value(s)": variant.label, "Attribute 1 global": 1,
    }));
  }
}

return rows;
}

writeFileSync("wp-theme/verdant-roots/demo/sample-products.csv", build({ published: 1, skipCombos: false, categoryNames: {}, tags: ["demo"] }).join("\n") + "\n");
// Draft starter list for prakritidhara.store: their 5 categories, nothing goes live until edited + published.
writeFileSync("wp-theme/verdant-roots/demo/prakritidhara-draft-products.csv", build({ published: -1, skipCombos: true, categoryNames: { "Dry Vegetable": "Dry Vegetables", Tablet: "Tablets" }, tags: ["sample-edit-me"] }).join("\n") + "\n");
writeFileSync("wp-theme/verdant-roots/demo/categories.json", JSON.stringify(demoCategories.map(({ name, slug, description, sortOrder }) => ({ name, slug, description, sortOrder })), null, 2));
writeFileSync("wp-theme/verdant-roots/demo/product-ages.json", JSON.stringify(dates, null, 2));
console.log("csv files written");
