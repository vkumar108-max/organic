"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductGridSkeleton } from "@/components/ui/Skeleton";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";
import type { Product, ProductListResult } from "@/types";

export function WishlistView() {
  const { hydrated, slugs, remove } = useWishlist();
  const addLine = useCart((state) => state.addLine);
  const notify = useUi((state) => state.notify);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const key = slugs.join(",");

  useEffect(() => {
    if (!hydrated) return;
    if (!key) return setProducts([]);
    const controller = new AbortController();
    setFailed(false);
    fetch(`/api/products?slugs=${encodeURIComponent(key)}&pageSize=50`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("failed"))))
      .then((data: ProductListResult) => setProducts(data.items))
      .catch((error) => error.name !== "AbortError" && setFailed(true));
    return () => controller.abort();
  }, [hydrated, key, attempt]);

  const moveToCart = (product: Product) => {
    const variant = product.variants.find((candidate) => candidate.stock > 0);
    if (!variant) return;
    addLine({ productId: product.id, variantId: variant.id, slug: product.slug, name: product.name, category: product.category, variantLabel: variant.label, price: variant.price, mrp: variant.mrp, stock: variant.stock });
    remove(product.slug);
    notify(`${product.name} moved to cart`, "success", { label: "View cart", href: "/cart" });
  };

  if (failed) {
    return <EmptyState icon="wifiOff" title="Couldn’t load your wishlist" description="Please check your connection and try again." >
      <div className="mt-6"><Button onClick={() => setAttempt((count) => count + 1)}>Retry</Button></div>
    </EmptyState>;
  }
  if (!hydrated || products === null) return <ProductGridSkeleton count={4} />;
  const visible = products.filter((product) => slugs.includes(product.slug));
  if (visible.length === 0) {
    return <EmptyState icon="heart" title="Your wishlist is empty" description="Tap the heart on any product to save it here for later." action={{ label: "Discover products", href: "/shop" }} />;
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {visible.map((product) => (
        <li key={product.id} className="flex flex-col gap-2">
          <ProductCard product={product} />
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" onClick={() => moveToCart(product)}>Move to cart</Button>
            <Button size="sm" variant="outline" onClick={() => remove(product.slug)}>Remove</Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

