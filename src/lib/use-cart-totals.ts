"use client";

import { useEffect } from "react";
import { calculateShipping } from "@/lib/pricing";
import { selectCartSubtotal, useCart } from "@/store/cart";

/** Derived cart numbers. Shipping/discount rules come from lib/pricing (shared with the server). */
export function useCartTotals() {
  const subtotal = useCart(selectCartSubtotal);
  const discount = useCart((state) => state.couponDiscount);
  const shipping = calculateShipping(subtotal - discount);
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

/** Re-validates the applied coupon whenever the subtotal changes (e.g. quantity edits). */
export function useCouponRevalidation() {
  const subtotal = useCart(selectCartSubtotal);
  const code = useCart((state) => state.couponCode);
  const hydrated = useCart((state) => state.hydrated);
  const setCoupon = useCart((state) => state.setCoupon);

  useEffect(() => {
    if (!hydrated || !code) return;
    const controller = new AbortController();
    fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, subtotal }), signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((result: { valid: boolean; discount: number } | null) => {
        if (!result) return;
        setCoupon(result.valid ? code : null, result.valid ? result.discount : 0);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [subtotal, code, hydrated, setCoupon]);
}
