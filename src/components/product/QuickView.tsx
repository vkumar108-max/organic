"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Rating } from "@/components/ui/Rating";
import { Skeleton } from "@/components/ui/Skeleton";
import { toneFor } from "@/lib/tone";
import type { Product } from "@/types";
import { AddToCartButton } from "./AddToCartButton";
import { ProductImage } from "./ProductImage";

/** Loads the product from the public API on demand, so cards stay lightweight. */
export function QuickViewButton({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open || product) return;
    let cancelled = false;
    setFailed(false);
    fetch(`/api/products/${encodeURIComponent(slug)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("failed"))))
      .then((data: Product) => !cancelled && setProduct(data))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [open, product, slug, attempt]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-ink shadow-md hover:bg-white"
        aria-label={`Quick view ${name}`}
      >
        <Icon name="eye" size={16} /> Quick view
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={name} size="lg">
        {failed ? (
          <p className="py-6 text-center text-ink-soft">
            We couldn’t load this product.{" "}
            <button type="button" className="font-semibold text-brand-700 underline" onClick={() => setAttempt((count) => count + 1)}>
              Try again
            </button>
          </p>
        ) : !product ? (
          <div className="grid gap-4 sm:grid-cols-2" role="status" aria-label="Loading product">
            <Skeleton className="aspect-square" />
            <div className="space-y-3"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-16" /></div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-card">
              <ProductImage image={product.images[0]} tone={toneFor(product)} sizes="(min-width:640px) 400px, 90vw" />
            </div>
            <div className="flex flex-col gap-3">
              <Rating value={product.rating} count={product.reviewCount} showValue />
              <PriceDisplay price={product.price} mrp={product.mrp} size="lg" />
              <p className="text-ink-soft">{product.shortDescription}</p>
              <p className="text-sm text-ink-soft">Starting price shown for {product.variants[0].label}.</p>
              <div className="mt-auto flex flex-col gap-2">
                <AddToCartButton product={product} />
                <Button href={`/product/${product.slug}`} variant="outline" full>View full details</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
