"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { shippingRules } from "@/config/site";
import { cn } from "@/lib/format";
import { useUi } from "@/store/ui";
import type { Product } from "@/types";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "./WishlistButton";

/** Variant picker, quantity, add-to-cart, buy-now, wishlist and share. */
export function ProductPurchase({ product }: { product: Product }) {
  const router = useRouter();
  const notify = useUi((state) => state.notify);
  const firstAvailable = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstAvailable.id);
  const [quantity, setQuantity] = useState(1);
  const variant = product.variants.find((candidate) => candidate.id === variantId) ?? firstAvailable;
  const soldOut = variant.stock <= 0;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        notify("Link copied to clipboard");
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <PriceDisplay price={variant.price} mrp={variant.mrp} size="lg" />
        <p className="mt-1 text-xs text-ink-soft">Inclusive of all taxes (confirm tax display with your accountant).</p>
      </div>

      {product.variants.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Size / weight: <span className="font-normal text-ink-soft">{variant.label}</span></legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((option) => (
              <label
                key={option.id}
                className={cn(
                  "relative cursor-pointer rounded-full border px-4 py-2 text-sm font-medium has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brand-500",
                  option.id === variantId ? "border-brand-600 bg-brand-50 text-brand-800" : "border-line hover:border-brand-300",
                  option.stock <= 0 && "opacity-50",
                )}
              >
                <input type="radio" name="variant" value={option.id} checked={option.id === variantId} onChange={() => { setVariantId(option.id); setQuantity(1); }} className="sr-only" />
                {option.label}
                {option.stock <= 0 && <span className="ml-1 text-xs">(sold out)</span>}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <p className={cn("text-sm font-medium", soldOut ? "text-danger" : variant.stock <= 10 ? "text-clay-600" : "text-brand-700")}>
        {soldOut ? "Out of stock" : variant.stock <= 10 ? `Only ${variant.stock} left` : "In stock"}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <QuantitySelector value={quantity} onChange={setQuantity} max={Math.min(20, Math.max(1, variant.stock))} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <AddToCartButton product={product} variant={variant} quantity={quantity} size="lg" />
        <AddToCartButton product={product} variant={variant} quantity={quantity} size="lg" buttonVariant="outline" label="Buy Now" onAdded={() => router.push("/checkout")} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <WishlistButton slug={product.slug} name={product.name} variant="full" />
        <Button variant="ghost" onClick={share}>
          <Icon name="share" size={18} /> Share
        </Button>
      </div>

      <ul className="grid gap-2 rounded-card bg-brand-50 p-4 text-sm text-ink-soft sm:grid-cols-2">
        <li className="flex items-center gap-2"><Icon name="lock" size={16} className="text-brand-700" /> Secure checkout</li>
        <li className="flex items-center gap-2"><Icon name="truck" size={16} className="text-brand-700" /> Free shipping over ₹{shippingRules.freeShippingThreshold}</li>
      </ul>
    </div>
  );
}
