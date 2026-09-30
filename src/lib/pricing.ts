import { shippingRules } from "@/config/site";
import type { Coupon } from "@/types";

export interface CouponCheck {
  valid: boolean;
  discount: number;
  message: string;
}

/** Pure coupon rules — used by the API route (authoritative) and unit-testable. */
export function evaluateCoupon(coupon: Coupon | undefined, subtotal: number, now = new Date()): CouponCheck {
  if (!coupon || !coupon.active) return { valid: false, discount: 0, message: "This coupon code is not valid." };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return { valid: false, discount: 0, message: "This coupon has expired." };
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
    return { valid: false, discount: 0, message: "This coupon has reached its usage limit." };
  if (subtotal < coupon.minOrder)
    return { valid: false, discount: 0, message: `Add items worth ₹${coupon.minOrder - subtotal} more to use this coupon.` };

  let discount = coupon.discountType === "percentage" ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue;
  if (coupon.discountType === "percentage" && coupon.maxDiscount !== null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(Math.round(discount), subtotal);
  return { valid: true, discount, message: `Coupon ${coupon.code} applied.` };
}

export const calculateShipping = (subtotalAfterDiscount: number) =>
  subtotalAfterDiscount === 0 || subtotalAfterDiscount >= shippingRules.freeShippingThreshold ? 0 : shippingRules.flatRate;

export function calculateTotals(subtotal: number, discount: number) {
  const shipping = calculateShipping(subtotal - discount);
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}
