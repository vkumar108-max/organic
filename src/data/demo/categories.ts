import type { Category } from "@/types";

/** DEMO DATA — replace by the backend `/categories` endpoint (see docs/API_CONTRACT.md). */
export const demoCategories: Category[] = [
  {
    id: "cat_fruit_powder",
    name: "Fruit Powder",
    slug: "fruit-powder",
    shortDescription: "Fruit powders for smoothies, baking and desserts.",
    description:
      "Finely milled fruit powders that are easy to stir into smoothies, curd, oats, baked goods and desserts. Check each product page for the ingredient list and pack size.",
    image: null,
    tone: "fruit",
    status: "active",
    sortOrder: 1,
    menuLinks: [
      { label: "All Fruit Powder" },
      { label: "Popular Products", query: "sort=popular" },
      { label: "New Arrivals", query: "sort=newest" },
    ],
    faqs: [
      { question: "How can I use fruit powder?", answer: "Fruit powders can be mixed into smoothies, curd, oats, pancake batter or dessert recipes. Follow the usage guidance on each product page." },
      { question: "How should I store fruit powder?", answer: "Keep the pack tightly closed in a cool, dry place away from direct sunlight and moisture. Use a dry spoon each time." },
    ],
  },
  {
    id: "cat_leaf_powder",
    name: "Leaf Powder",
    slug: "leaf-powder",
    shortDescription: "Traditional leaf powders for teas, chutneys and cooking.",
    description:
      "Leaf powders made from dried, milled leaves, used in teas, chutneys, rotis and seasoning blends. Product pages list pack sizes and usage suggestions.",
    image: null,
    tone: "leaf",
    status: "active",
    sortOrder: 2,
    menuLinks: [
      { label: "All Leaf Powder" },
      { label: "Popular Products", query: "sort=popular" },
      { label: "New Arrivals", query: "sort=newest" },
    ],
    faqs: [
      { question: "What is leaf powder used for?", answer: "Culinary uses include stirring into warm water for tea, mixing into dough or batter, and adding to chutneys and spice blends." },
    ],
  },
  {
    id: "cat_vegetable_powder",
    name: "Vegetable Powder",
    slug: "vegetable-powder",
    shortDescription: "Vegetable powders to add colour and flavour to meals.",
    description:
      "Dehydrated, ground vegetables that blend into soups, doughs, sauces and batters. A convenient pantry staple when fresh produce is not at hand.",
    image: null,
    tone: "vegetable",
    status: "active",
    sortOrder: 3,
    menuLinks: [
      { label: "All Vegetable Powder" },
      { label: "Popular Products", query: "sort=popular" },
      { label: "New Arrivals", query: "sort=newest" },
    ],
    faqs: [
      { question: "Can vegetable powder replace fresh vegetables?", answer: "It is meant as a convenient addition to recipes, not a substitute for a varied diet with fresh produce." },
    ],
  },
  {
    id: "cat_combos",
    name: "Combos",
    slug: "combos",
    shortDescription: "Curated packs that bundle favourites for better value.",
    description:
      "Hand-picked bundles of our most-loved products. Combos are priced lower than buying each item separately, making them a convenient way to try more.",
    image: null,
    tone: "combo",
    status: "active",
    sortOrder: 4,
    menuLinks: [
      { label: "All Combos" },
      { label: "Best Combos", query: "sort=popular" },
      { label: "Value Combos", query: "sort=price-asc" },
    ],
    faqs: [
      { question: "Can I change items inside a combo?", answer: "Combos are sold as listed. Please contact us if you would like a custom bundle." },
    ],
  },
  {
    id: "cat_tablet",
    name: "Tablet",
    slug: "tablet",
    shortDescription: "Convenient tablet formats, packed for easy use.",
    description:
      "Tablet-format products packed for convenience. Always read the label, ingredient list and usage guidance on the pack. Consult a qualified professional if you have any medical condition.",
    image: null,
    tone: "tablet",
    status: "active",
    sortOrder: 5,
    menuLinks: [{ label: "All Tablets" }],
    faqs: [
      { question: "Are these medicines?", answer: "Product classification, dosage and permitted claims must be confirmed by the business before publishing. This demo text makes no medical claims." },
    ],
  },
  {
    id: "cat_dry_vegetable",
    name: "Dry Vegetable",
    slug: "dry-vegetable",
    shortDescription: "Sun-dried and dehydrated vegetables for the pantry.",
    description:
      "Dried vegetables that keep well and rehydrate easily for curries, stir-fries and traditional recipes. Soak or cook directly, as described on each product page.",
    image: null,
    tone: "dry",
    status: "active",
    sortOrder: 6,
    menuLinks: [{ label: "All Dry Vegetables" }],
    faqs: [
      { question: "How do I cook dry vegetables?", answer: "Most dry vegetables are soaked in warm water for a short time before cooking. Refer to the product page for guidance." },
    ],
  },
];
