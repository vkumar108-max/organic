"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { shippingRules } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { useCartTotals } from "@/lib/use-cart-totals";
import { useCart } from "@/store/cart";

export function TotalsTable() {
  const { subtotal, discount, shipping, total } = useCartTotals();
  const couponCode = useCart((state) => state.couponCode);
  const row = "flex items-center justify-between py-1.5";
  return (
    <dl className="text-sm">
      <div className={row}><dt className="text-ink-soft">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
      {discount > 0 && <div className={`${row} text-brand-700`}><dt>Discount{couponCode ? ` (${couponCode})` : ""}</dt><dd>−{formatPrice(discount)}</dd></div>}
      <div className={row}><dt className="text-ink-soft">Shipping</dt><dd>{shipping === 0 ? <span className="font-medium text-brand-700">Free</span> : formatPrice(shipping)}</dd></div>
      <div className={`${row} mt-2 border-t border-line pt-3 text-base font-bold`}><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
    </dl>
  );
}

function FreeShippingProgress() {
  const { subtotal, discount } = useCartTotals();
  const remaining = shippingRules.freeShippingThreshold - (subtotal - discount);
  const percent = Math.min(100, Math.round(((subtotal - discount) / shippingRules.freeShippingThreshold) * 100));
  return (
    <div className="mb-4 rounded-lg bg-brand-50 p-3 text-sm">
      <p>{remaining > 0 ? <>Add <strong>{formatPrice(remaining)}</strong> more for free shipping</> : "🎉 You’ve unlocked free shipping"}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-200" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free shipping">
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function CouponBox() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { subtotal } = useCartTotals();
  const couponCode = useCart((state) => state.couponCode);
  const setCoupon = useCart((state) => state.setCoupon);

  const apply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: input, subtotal }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? "Couldn’t check the coupon.");
      if (data.valid) {
        setCoupon(data.code, data.discount);
        setInput("");
      }
      setStatus({ tone: data.valid ? "ok" : "error", text: data.message });
    } catch (error) {
      setStatus({ tone: "error", text: error instanceof Error ? error.message : "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (couponCode) {
    return (
      <div className="mb-4 flex items-center justify-between rounded-lg border border-brand-300 bg-brand-50 px-3 py-2 text-sm">
        <span>Coupon <strong>{couponCode}</strong> applied</span>
        <button type="button" className="font-semibold text-brand-700 underline" onClick={() => { setCoupon(null, 0); setStatus(null); }}>Remove</button>
      </div>
    );
  }
  return (
    <form onSubmit={apply} className="mb-4">
      <label htmlFor="coupon" className="mb-1.5 block text-sm font-medium">Have a coupon?</label>
      <div className="flex gap-2">
        <input id="coupon" value={input} onChange={(event) => setInput(event.target.value.toUpperCase())} placeholder="Enter code" maxLength={30} autoComplete="off" className="min-w-0 flex-1 rounded-full border border-line px-4 py-2.5 text-sm uppercase" />
        <Button type="submit" size="sm" variant="outline" disabled={loading || !input.trim()}>{loading ? "…" : "Apply"}</Button>
      </div>
      <p role="status" className={`mt-1.5 min-h-5 text-sm ${status?.tone === "error" ? "text-danger" : "text-brand-700"}`}>{status?.text}</p>
    </form>
  );
}

export function CartSummary({ children }: { children?: ReactNode }) {
  return (
    <aside aria-labelledby="summary-title" className="h-fit rounded-card border border-line bg-white p-5 shadow-card lg:sticky lg:top-40">
      <h2 id="summary-title" className="mb-4 font-sans text-lg font-semibold">Order summary</h2>
      <FreeShippingProgress />
      <CouponBox />
      <TotalsTable />
      {children}
    </aside>
  );
}
