import type { Review } from "@/types";

/**
 * SAMPLE reviews for layout development only. Every entry has isSample: true and
 * the UI labels them as sample content. Do NOT ship these to production.
 */
export const demoReviews: Review[] = [
  { id: "rev_1", productId: null, author: "Sample Customer A", rating: 5, title: "Sample review", body: "Placeholder text showing how a five-star review looks in this layout.", verifiedPurchase: true, createdAt: "2026-07-12T00:00:00.000Z", isSample: true },
  { id: "rev_2", productId: null, author: "Sample Customer B", rating: 4, title: "Sample review", body: "Placeholder text showing how a four-star review with a shorter comment looks.", verifiedPurchase: true, createdAt: "2026-07-20T00:00:00.000Z", isSample: true },
  { id: "rev_3", productId: null, author: "Sample Customer C", rating: 5, title: "Sample review", body: "Placeholder text. Real customer reviews will replace this sample content.", verifiedPurchase: false, createdAt: "2026-08-02T00:00:00.000Z", isSample: true },
];
