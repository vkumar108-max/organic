"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import type { Product, ProductVariant } from "@/types";

interface AddToCartButtonProps {
  product: Pick<Product, "id" | "slug" | "name" | "category" | "variants">;
  variant?: ProductVariant;
  quantity?: number;
  size?: "sm" | "md" | "lg";
  full?: boolean;
  label?: string;
  /** When set, called after adding (e.g. Buy Now navigates to checkout) */
  onAdded?: () => void;
  buttonVariant?: "primary" | "outline";
}

export function AddToCartButton({ product, variant, quantity = 1, size = "md", full = true, label = "Add to Cart", onAdded, buttonVariant = "primary" }: AddToCartButtonProps) {
  const addLine = useCart((state) => state.addLine);
  const notify = useUi((state) => state.notify);
  const chosen = variant ?? product.variants.find((candidate) => candidate.stock > 0) ?? product.variants[0];
  const soldOut = !chosen || chosen.stock <= 0;

  const onClick = () => {
    if (soldOut) return;
    addLine(
      {
        productId: product.id,
        variantId: chosen.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        variantLabel: chosen.label,
        price: chosen.price,
        mrp: chosen.mrp,
        stock: chosen.stock,
      },
      quantity,
    );
    notify(`${product.name} added to cart`, "success", { label: "View cart", href: "/cart" });
    onAdded?.();
  };

  return (
    <Button size={size} full={full} variant={buttonVariant} onClick={onClick} disabled={soldOut}>
      {soldOut ? "Out of stock" : (<><Icon name="cart" size={18} />{label}</>)}
    </Button>
  );
}
