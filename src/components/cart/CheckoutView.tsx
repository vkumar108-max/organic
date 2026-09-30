"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { Icon } from "@/components/ui/Icon";
import { CartSkeleton } from "@/components/ui/Skeleton";
import { paymentOptions, shippingRules, site } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { payWithRazorpay } from "@/lib/payments/razorpay-client";
import { indianStates } from "@/lib/states";
import { useCouponRevalidation } from "@/lib/use-cart-totals";
import { addressSchema, fieldErrors } from "@/lib/validation";
import { useCart } from "@/store/cart";
import { useDemoOrders } from "@/store/orders";
import type { Address, Order, PaymentMethod } from "@/types";
import { CartLineThumb } from "./CartView";
import { CartSummary } from "./CartSummary";

export function CheckoutView() {
  const router = useRouter();
  const { hydrated, lines, couponCode, clear } = useCart();
  const addDemoOrder = useDemoOrders((state) => state.add);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [method, setMethod] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  useCouponRevalidation();

  if (!hydrated) return <CartSkeleton />;
  if (lines.length === 0) {
    return <EmptyState icon="cart" title="Your cart is empty" description="Add something to your cart before checking out." action={{ label: "Start shopping", href: "/shop" }} />;
  }

  const finish = (order: Order, persisted: boolean) => {
    if (!persisted) addDemoOrder(order);
    clear();
    router.push(`/checkout/success?order=${encodeURIComponent(order.id)}`);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const raw = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const parsed = addressSchema.safeParse({ ...raw, line2: raw.line2 || undefined });
    if (!parsed.success) {
      const found = fieldErrors(parsed.error);
      setErrors(found);
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    setErrors({});
    const address: Address = parsed.data;
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((line) => ({ productId: line.productId, variantId: line.variantId, quantity: line.quantity })),
          address,
          paymentMethod: method,
          couponCode: couponCode ?? undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data?.error?.fields) setErrors(data.error.fields);
        throw new Error(data?.error?.message ?? "We couldn’t place your order.");
      }
      const order = data.order as Order;
      if (data.payment) {
        const outcome = await payWithRazorpay(data.payment, order, address, site.name);
        if (outcome === "failed") return router.push(`/checkout/failed?order=${encodeURIComponent(order.id)}`);
      }
      finish(order, Boolean(data.persisted));
    } catch (error) {
      setFormError(error instanceof TypeError ? "Network error — please check your connection and try again." : error instanceof Error ? error.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-8">
        {site.dataMode === "demo" && (
          <p className="rounded-lg border border-dashed border-clay-500/50 bg-sand-50 p-3 text-sm text-clay-600">
            <strong>Demo mode:</strong> orders are checked on the server but not saved, and no money is taken. Cash on Delivery completes the flow; online payments need a payment provider.
          </p>
        )}
        {formError && <div role="alert" className="flex gap-3 rounded-lg border border-danger/40 bg-red-50 p-4 text-sm text-danger"><Icon name="alert" size={18} />{formError}</div>}

        <fieldset className="space-y-4">
          <legend className="mb-3 font-display text-xl font-semibold">1. Contact & delivery</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full name" name="fullName" id="fullName" autoComplete="name" required error={errors.fullName} />
            <FormField label="Mobile number" name="mobile" id="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} required error={errors.mobile} hint="10-digit Indian mobile number" />
          </div>
          <FormField label="Email" name="email" id="email" type="email" autoComplete="email" required error={errors.email} hint="We’ll send your order confirmation here" />
          <FormField label="Address" name="line1" id="line1" autoComplete="address-line1" required error={errors.line1} placeholder="House / flat, street, area" />
          <FormField label="Landmark (optional)" name="line2" id="line2" autoComplete="address-line2" error={errors.line2} />
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="City" name="city" id="city" autoComplete="address-level2" required error={errors.city} />
            <div>
              <label htmlFor="state" className="mb-1.5 block text-sm font-medium">State <span className="text-danger" aria-hidden="true">*</span></label>
              <select id="state" name="state" required autoComplete="address-level1" defaultValue="" aria-invalid={!!errors.state} className={`w-full rounded-lg border bg-white px-4 py-3 text-[0.95rem] ${errors.state ? "border-danger" : "border-line"}`}>
                <option value="" disabled>Select state</option>
                {indianStates.map((state) => <option key={state}>{state}</option>)}
              </select>
              {errors.state && <p className="mt-1 text-sm text-danger">{errors.state}</p>}
            </div>
            <FormField label="PIN code" name="pincode" id="pincode" inputMode="numeric" autoComplete="postal-code" maxLength={6} required error={errors.pincode} />
          </div>
        </fieldset>

        <section aria-labelledby="ship-title">
          <h2 id="ship-title" className="mb-3 font-display text-xl font-semibold">2. Shipping</h2>
          <div className="flex gap-3 rounded-card border border-line p-4 text-sm">
            <Icon name="truck" className="text-brand-700" />
            <p><strong>Standard delivery.</strong> {shippingRules.estimatedDelivery}. Free above {formatPrice(shippingRules.freeShippingThreshold)}, otherwise {formatPrice(shippingRules.flatRate)}.</p>
          </div>
        </section>

        <fieldset>
          <legend className="mb-3 font-display text-xl font-semibold">3. Payment method</legend>
          <div className="space-y-2">
            {paymentOptions.filter((option) => option.enabled).map((option) => (
              <label key={option.id} className={`flex cursor-pointer items-start gap-3 rounded-card border p-4 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brand-500 ${method === option.id ? "border-brand-600 bg-brand-50" : "border-line hover:border-brand-300"}`}>
                <input type="radio" name="payment" className="mt-1 h-4 w-4 accent-brand-600" checked={method === option.id} onChange={() => setMethod(option.id)} />
                <span><span className="block font-semibold">{option.label}</span><span className="text-sm text-ink-soft">{option.description}</span></span>
              </label>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-ink-soft"><Icon name="lock" size={14} /> Card, UPI and bank details are entered on the payment provider’s secure page. We never store them.</p>
        </fieldset>
      </div>

      <CartSummary>
        <ul className="mb-4 max-h-56 space-y-3 overflow-y-auto border-b border-line pb-4" aria-label="Items in your order">
          {lines.map((line) => (
            <li key={line.variantId} className="flex items-center gap-3 text-sm">
              <CartLineThumb line={line} size={48} />
              <span className="min-w-0 flex-1"><span className="line-clamp-1 font-medium">{line.name}</span><span className="text-ink-soft">{line.variantLabel} × {line.quantity}</span></span>
              <span className="font-medium">{formatPrice(line.price * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <Button type="submit" size="lg" full disabled={submitting} className="mt-5">
          {submitting ? "Placing your order…" : method === "cod" ? "Place Order" : "Pay Securely"}
        </Button>
        <p className="mt-3 text-center text-xs text-ink-soft">By placing your order you agree to our <Link href="/terms-and-conditions" className="underline">Terms</Link> and <Link href="/refund-policy" className="underline">Refund Policy</Link>.</p>
      </CartSummary>
    </form>
  );
}
