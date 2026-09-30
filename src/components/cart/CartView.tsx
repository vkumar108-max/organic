"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { ProductArt } from "@/components/ui/ProductArt";
import { CartSkeleton } from "@/components/ui/Skeleton";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { formatPrice } from "@/lib/format";
import { toneFor } from "@/lib/tone";
import { useCouponRevalidation } from "@/lib/use-cart-totals";
import { MAX_PER_LINE, useCart, type CartLine } from "@/store/cart";
import { useUi } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";
import { CartSummary } from "./CartSummary";

export function CartLineThumb({ line, size = 96 }: { line: CartLine; size?: number }) {
  return (
    <div className="shrink-0 overflow-hidden rounded-lg bg-brand-50" style={{ width: size, height: size }}>
      <ProductArt tone={toneFor({ category: line.category, productType: "powder" })} label={`${line.name} (placeholder image)`} className="h-full w-full" />
    </div>
  );
}

function CartRow({ line }: { line: CartLine }) {
  const setQuantity = useCart((state) => state.setQuantity);
  const removeLine = useCart((state) => state.removeLine);
  const toggleWishlist = useWishlist((state) => state.toggle);
  const saved = useWishlist((state) => state.slugs.includes(line.slug));
  const notify = useUi((state) => state.notify);

  const moveToWishlist = () => {
    if (!saved) toggleWishlist(line.slug);
    removeLine(line.variantId);
    notify(`${line.name} moved to wishlist`);
  };

  return (
    <li className="flex gap-4 rounded-card border border-line bg-white p-3 sm:p-4">
      <Link href={`/product/${line.slug}`} aria-label={line.name}><CartLineThumb line={line} /></Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-sans text-base font-semibold leading-snug"><Link href={`/product/${line.slug}`} className="hover:text-brand-700">{line.name}</Link></h3>
            <p className="text-sm text-ink-soft">Size: {line.variantLabel}</p>
          </div>
          <p className="whitespace-nowrap font-bold">{formatPrice(line.price * line.quantity)}</p>
        </div>
        <p className="text-sm text-ink-soft">{formatPrice(line.price)} each{line.mrp > line.price && <span className="ml-2 line-through">{formatPrice(line.mrp)}</span>}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          <QuantitySelector size="sm" value={line.quantity} max={Math.min(MAX_PER_LINE, line.stock)} onChange={(value) => setQuantity(line.variantId, value)} label={`Quantity of ${line.name}`} />
          <div className="flex gap-1 text-sm">
            <button type="button" onClick={moveToWishlist} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-medium text-ink-soft hover:bg-brand-50"><Icon name="heart" size={15} /> Move to wishlist</button>
            <button type="button" onClick={() => removeLine(line.variantId)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-medium text-danger hover:bg-red-50" aria-label={`Remove ${line.name} from cart`}><Icon name="trash" size={15} /> Remove</button>
          </div>
        </div>
      </div>
    </li>
  );
}

export function CartView() {
  const hydrated = useCart((state) => state.hydrated);
  const lines = useCart((state) => state.lines);
  useCouponRevalidation();

  if (!hydrated) return <CartSkeleton />;
  if (lines.length === 0) {
    return <EmptyState icon="cart" title="Your cart is empty" description="Looks like you haven’t added anything yet. Explore our categories to find something you like." action={{ label: "Start shopping", href: "/shop" }} secondary={{ label: "Browse categories", href: "/categories" }} />;
  }
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <ul className="space-y-3">{lines.map((line) => <CartRow key={line.variantId} line={line} />)}</ul>
      <CartSummary>
        <div className="mt-5 flex flex-col gap-2">
          <Button href="/checkout" size="lg" full>Proceed to Checkout</Button>
          <Button href="/shop" variant="ghost" full>Continue Shopping</Button>
        </div>
      </CartSummary>
    </div>
  );
}
