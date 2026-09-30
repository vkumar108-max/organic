import type { Coupon } from "@/types";

/** DEMO DATA — coupons are validated server side (`/api/coupons/validate`). */
export const demoCoupons: Coupon[] = [
  { code: "WELCOME10", discountType: "percentage", discountValue: 10, minOrder: 299, maxDiscount: 100, expiresAt: "2030-12-31T23:59:59.000Z", usageLimit: null, usedCount: 0, active: true },
  { code: "FLAT50", discountType: "fixed", discountValue: 50, minOrder: 499, maxDiscount: null, expiresAt: "2030-12-31T23:59:59.000Z", usageLimit: 1000, usedCount: 0, active: true },
  { code: "EXPIRED5", discountType: "percentage", discountValue: 5, minOrder: 0, maxDiscount: null, expiresAt: "2020-01-01T00:00:00.000Z", usageLimit: null, usedCount: 0, active: true },
];
