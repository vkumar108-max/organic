import type { Product, ProductImage, ProductTone, ProductType, ProductVariant } from "@/types";

/**
 * DEMO DATA — generated from a compact table so the sample catalogue stays easy
 * to read. Replace with the backend `/products` endpoint (see
 * docs/API_CONTRACT.md); no UI component imports this file directly.
 *
 * Ingredient / nutrition / usage details are intentionally `null` so the UI
 * shows "to be provided" placeholders instead of invented facts.
 */

interface Row {
  name: string;
  category: string;
  sub?: string;
  type: ProductType;
  /** price of the first variant */
  base: number;
  keywords: string[];
  short: string;
  flags?: Partial<Pick<Product, "featured" | "bestSeller" | "newArrival">>;
  rating: number;
  reviews: number;
  popularity: number;
  /** days ago the product was added (drives "newest") */
  age: number;
  stock?: number;
}

const toneByCategory: Record<string, ProductTone> = {
  "fruit-powder": "fruit",
  "leaf-powder": "leaf",
  "vegetable-powder": "vegetable",
  combos: "combo",
  tablet: "tablet",
  "dry-vegetable": "dry",
};

const powderSizes: [string, number][] = [["100 g", 1], ["250 g", 2.2], ["500 g", 4]];
const drySizes: [string, number][] = [["100 g", 1], ["250 g", 2.3]];
const tabletSizes: [string, number][] = [["60 tablets", 1], ["120 tablets", 1.8]];
const comboSizes: [string, number][] = [["1 pack", 1]];

const sizesFor = (type: ProductType) =>
  type === "tablet" ? tabletSizes : type === "dry" ? drySizes : type === "combo" ? comboSizes : powderSizes;

const slugify = (text: string) =>
  text.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const rows: Row[] = [
  // ---- Fruit powder
  { name: "Mango Powder", category: "fruit-powder", sub: "Tropical", type: "powder", base: 199, keywords: ["mango", "amchur", "tropical", "smoothie"], short: "Tangy mango powder for drinks, chutneys and desserts.", flags: { bestSeller: true, featured: true }, rating: 4.6, reviews: 128, popularity: 95, age: 200 },
  { name: "Banana Powder", category: "fruit-powder", sub: "Everyday", type: "powder", base: 179, keywords: ["banana", "smoothie", "baking"], short: "Smooth banana powder for shakes, porridge and baking.", rating: 4.4, reviews: 76, popularity: 70, age: 150 },
  { name: "Apple Powder", category: "fruit-powder", sub: "Everyday", type: "powder", base: 219, keywords: ["apple", "oats", "dessert"], short: "Lightly sweet apple powder for oats, cakes and drinks.", flags: { bestSeller: true }, rating: 4.5, reviews: 91, popularity: 88, age: 120 },
  { name: "Papaya Powder", category: "fruit-powder", sub: "Tropical", type: "powder", base: 189, keywords: ["papaya", "tropical"], short: "Papaya powder to stir into smoothies and yoghurt.", rating: 4.3, reviews: 44, popularity: 55, age: 90 },
  { name: "Pomegranate Powder", category: "fruit-powder", sub: "Everyday", type: "powder", base: 249, keywords: ["pomegranate", "anardana", "chutney"], short: "Tart pomegranate powder for chaat, drinks and marinades.", flags: { newArrival: true }, rating: 4.7, reviews: 58, popularity: 74, age: 12 },
  { name: "Strawberry Powder", category: "fruit-powder", sub: "Berries", type: "powder", base: 299, keywords: ["strawberry", "berry", "dessert", "baking"], short: "Colourful strawberry powder for icing, shakes and bakes.", flags: { newArrival: true }, rating: 4.5, reviews: 33, popularity: 60, age: 8 },
  { name: "Amla Powder", category: "fruit-powder", sub: "Everyday", type: "powder", base: 169, keywords: ["amla", "gooseberry", "indian gooseberry"], short: "Tangy amla (gooseberry) powder for cooking and drinks.", rating: 4.6, reviews: 112, popularity: 92, age: 220 },
  { name: "Lemon Powder", category: "fruit-powder", sub: "Citrus", type: "powder", base: 159, keywords: ["lemon", "citrus", "nimbu"], short: "Citrusy lemon powder for drinks, salads and seasoning.", rating: 4.2, reviews: 29, popularity: 40, age: 60 },

  // ---- Leaf powder
  { name: "Moringa Leaf Powder", category: "leaf-powder", sub: "Everyday", type: "powder", base: 189, keywords: ["moringa", "drumstick", "leaf", "green"], short: "Fine moringa leaf powder for teas, rotis and smoothies.", flags: { bestSeller: true, featured: true }, rating: 4.7, reviews: 210, popularity: 100, age: 240 },
  { name: "Curry Leaf Powder", category: "leaf-powder", sub: "Kitchen", type: "powder", base: 149, keywords: ["curry leaf", "karivepaku", "seasoning", "rice"], short: "Aromatic curry leaf powder for rice, podi and seasoning.", flags: { bestSeller: true }, rating: 4.5, reviews: 97, popularity: 84, age: 180 },
  { name: "Tulsi Leaf Powder", category: "leaf-powder", sub: "Tea", type: "powder", base: 159, keywords: ["tulsi", "holy basil", "tea"], short: "Tulsi (holy basil) leaf powder for herbal-style tea.", rating: 4.6, reviews: 84, popularity: 78, age: 130 },
  { name: "Mint Leaf Powder", category: "leaf-powder", sub: "Kitchen", type: "powder", base: 139, keywords: ["mint", "pudina", "chutney", "raita"], short: "Cooling mint leaf powder for raita, chutney and drinks.", rating: 4.3, reviews: 52, popularity: 58, age: 100 },
  { name: "Neem Leaf Powder", category: "leaf-powder", sub: "Traditional", type: "powder", base: 149, keywords: ["neem", "leaf"], short: "Traditional neem leaf powder. See label for guidance.", flags: { newArrival: true }, rating: 4.1, reviews: 21, popularity: 35, age: 15 },
  { name: "Hibiscus Leaf Powder", category: "leaf-powder", sub: "Tea", type: "powder", base: 179, keywords: ["hibiscus", "gudhal", "tea"], short: "Tart hibiscus powder for iced teas and drinks.", rating: 4.4, reviews: 27, popularity: 45, age: 70 },

  // ---- Vegetable powder
  { name: "Beetroot Powder", category: "vegetable-powder", sub: "Root", type: "powder", base: 179, keywords: ["beetroot", "beet", "colour", "smoothie"], short: "Deep-coloured beetroot powder for batters, drinks and dips.", flags: { bestSeller: true, featured: true }, rating: 4.6, reviews: 143, popularity: 90, age: 210 },
  { name: "Spinach Powder", category: "vegetable-powder", sub: "Leafy", type: "powder", base: 169, keywords: ["spinach", "palak", "green"], short: "Green spinach powder for rotis, pasta dough and soups.", rating: 4.4, reviews: 66, popularity: 68, age: 140 },
  { name: "Carrot Powder", category: "vegetable-powder", sub: "Root", type: "powder", base: 159, keywords: ["carrot", "gajar"], short: "Sweet carrot powder for halwa, soups and baby-food recipes.", rating: 4.5, reviews: 59, popularity: 62, age: 110 },
  { name: "Tomato Powder", category: "vegetable-powder", sub: "Kitchen", type: "powder", base: 149, keywords: ["tomato", "sauce", "curry"], short: "Concentrated tomato powder for gravies, soups and sauces.", rating: 4.5, reviews: 88, popularity: 80, age: 160 },
  { name: "Pumpkin Powder", category: "vegetable-powder", sub: "Gourd", type: "powder", base: 169, keywords: ["pumpkin", "kaddu"], short: "Mild pumpkin powder for soups, porridge and doughs.", flags: { newArrival: true }, rating: 4.2, reviews: 18, popularity: 38, age: 10 },

  // ---- Combos
  { name: "Fruit Powder Trio", category: "combos", sub: "Fruit", type: "combo", base: 499, keywords: ["combo", "fruit", "mango", "apple", "banana", "pack"], short: "Mango, Apple and Banana powders in one value pack.", flags: { bestSeller: true, featured: true }, rating: 4.7, reviews: 64, popularity: 86, age: 100 },
  { name: "Everyday Green Combo", category: "combos", sub: "Leaf", type: "combo", base: 449, keywords: ["combo", "moringa", "curry leaf", "mint", "pack"], short: "Moringa, Curry Leaf and Mint leaf powders together.", flags: { bestSeller: true }, rating: 4.6, reviews: 52, popularity: 82, age: 90 },
  { name: "Kitchen Vegetable Starter Pack", category: "combos", sub: "Vegetable", type: "combo", base: 429, keywords: ["combo", "tomato", "beetroot", "spinach", "pack"], short: "Tomato, Beetroot and Spinach powders for everyday cooking.", rating: 4.5, reviews: 37, popularity: 66, age: 80 },
  { name: "Family Pantry Combo", category: "combos", sub: "Mixed", type: "combo", base: 899, keywords: ["combo", "family", "pantry", "mixed", "pack"], short: "A larger mixed pack across fruit, leaf and vegetable powders.", flags: { newArrival: true }, rating: 4.8, reviews: 15, popularity: 72, age: 6 },

  // ---- Tablet
  { name: "Moringa Tablets", category: "tablet", sub: "Leaf", type: "tablet", base: 249, keywords: ["moringa", "tablet", "capsule"], short: "Moringa in convenient tablet form. Read the label before use.", flags: { bestSeller: true }, rating: 4.4, reviews: 47, popularity: 64, age: 130 },
  { name: "Amla Tablets", category: "tablet", sub: "Fruit", type: "tablet", base: 229, keywords: ["amla", "tablet", "gooseberry"], short: "Amla tablets, packed for easy use. Read the label before use.", rating: 4.3, reviews: 39, popularity: 54, age: 110 },
  { name: "Tulsi Tablets", category: "tablet", sub: "Leaf", type: "tablet", base: 219, keywords: ["tulsi", "tablet", "holy basil"], short: "Tulsi tablets, packed for easy use. Read the label before use.", flags: { newArrival: true }, rating: 4.2, reviews: 12, popularity: 42, age: 9 },

  // ---- Dry vegetable
  { name: "Dry Okra (Bhindi)", category: "dry-vegetable", sub: "Sun-dried", type: "dry", base: 199, keywords: ["okra", "bhindi", "ladyfinger", "dry"], short: "Crisp dried okra for stir-fries and traditional curries.", flags: { bestSeller: true }, rating: 4.4, reviews: 41, popularity: 60, age: 170 },
  { name: "Dry Cluster Beans", category: "dry-vegetable", sub: "Sun-dried", type: "dry", base: 179, keywords: ["cluster beans", "gavar", "guar", "dry"], short: "Sun-dried cluster beans for traditional recipes.", rating: 4.3, reviews: 26, popularity: 44, age: 140 },
  { name: "Dehydrated Onion Flakes", category: "dry-vegetable", sub: "Dehydrated", type: "dry", base: 129, keywords: ["onion", "flakes", "dehydrated", "dry"], short: "Onion flakes for quick gravies, rice and seasoning.", rating: 4.5, reviews: 73, popularity: 76, age: 190 },
  { name: "Dry Bitter Gourd Slices", category: "dry-vegetable", sub: "Sun-dried", type: "dry", base: 169, keywords: ["bitter gourd", "karela", "dry"], short: "Sun-dried karela slices for fry and curry recipes.", rating: 4.1, reviews: 19, popularity: 30, age: 100 },
  { name: "Dry Ridge Gourd", category: "dry-vegetable", sub: "Sun-dried", type: "dry", base: 159, keywords: ["ridge gourd", "turai", "beerakaya", "dry"], short: "Dried ridge gourd for traditional home-style dishes.", flags: { newArrival: true }, rating: 4.2, reviews: 8, popularity: 28, age: 14 },
];

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 8, 1);

function buildVariants(row: Row, index: number): ProductVariant[] {
  return sizesFor(row.type).map(([label, multiplier], variantIndex) => {
    const price = Math.round((row.base * multiplier) / 1) - (variantIndex > 0 ? 1 : 0);
    const mrp = Math.ceil((price * 1.25) / 10) * 10;
    return {
      id: `var_${index + 1}_${variantIndex + 1}`,
      label,
      price,
      mrp,
      stock: row.stock ?? (row.name === "Neem Leaf Powder" && variantIndex === 2 ? 0 : 40 - variantIndex * 8),
      sku: `VR-${String(index + 1).padStart(3, "0")}-${variantIndex + 1}`,
    };
  });
}

function buildImages(row: Row): ProductImage[] {
  const views = ["front view", "back label view", "in a bowl", "pack shot"];
  return views.map((view) => ({ src: null, alt: `${row.name} — ${view} (placeholder image)` }));
}

export const demoProducts: Product[] = rows.map((row, index) => {
  const variants = buildVariants(row, index);
  const first = variants[0];
  const created = new Date(NOW - row.age * DAY).toISOString();
  return {
    id: `prod_${index + 1}`,
    name: row.name,
    slug: slugify(row.name),
    category: row.category,
    subcategory: row.sub,
    productType: row.type,
    description: `${row.short} This is a demo listing — replace this text with your verified product description.`,
    shortDescription: row.short,
    highlights: [
      "Packed in a resealable pouch (confirm packaging details)",
      "Available in multiple pack sizes",
      "Full ingredient list on the pack label",
    ],
    images: buildImages(row),
    price: first.price,
    mrp: first.mrp,
    discount: Math.round(((first.mrp - first.price) / first.mrp) * 100),
    variants,
    stock: variants.reduce((sum, variant) => sum + variant.stock, 0),
    sku: `VR-${String(index + 1).padStart(3, "0")}`,
    ingredients: null,
    usage: null,
    storage: "Store in a cool, dry place in an airtight container, away from direct sunlight and moisture. (Confirm with your packaging details.)",
    nutrition: null,
    keywords: row.keywords,
    rating: row.rating,
    reviewCount: row.reviews,
    popularity: row.popularity,
    featured: row.flags?.featured ?? false,
    bestSeller: row.flags?.bestSeller ?? false,
    newArrival: row.flags?.newArrival ?? false,
    status: "active",
    createdAt: created,
    updatedAt: created,
  };
});

export { toneByCategory };
