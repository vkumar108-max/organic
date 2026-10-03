import Link from "next/link";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Rating } from "@/components/ui/Rating";
import { discountPercent } from "@/lib/format";
import { toneFor } from "@/lib/tone";
import type { Product } from "@/types";
import { AddToCartButton } from "./AddToCartButton";
import { ProductImage } from "./ProductImage";
import { QuickViewButton } from "./QuickView";
import { WishlistButton } from "./WishlistButton";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

/** Server component: only the three small buttons ship JavaScript. */
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const discount = discountPercent(product.price, product.mrp);
  const soldOut = product.stock <= 0;
  const href = `/product/${product.slug}`;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-square overflow-hidden bg-brand-50">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="block h-full">
          <ProductImage
            image={product.images[0]}
            tone={toneFor(product)}
            sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 46vw"
            priority={priority}
            className="transition duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.newArrival && <span className="rounded-full bg-clay-500 px-2 py-0.5 text-[0.7rem] font-bold uppercase text-white">New</span>}
          {product.bestSeller && <span className="rounded-full bg-brand-700 px-2 py-0.5 text-[0.7rem] font-bold uppercase text-white">Best seller</span>}
        </div>
        <div className="absolute right-2 top-2">
          <WishlistButton slug={product.slug} name={product.name} />
        </div>
        <div className="absolute inset-x-2 bottom-2 hidden justify-center opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100 md:flex">
          <QuickViewButton slug={product.slug} name={product.name} />
        </div>
        {soldOut && <div className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-bold text-ink">Out of stock</div>}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[2.6em] font-sans text-[0.95rem] font-semibold leading-snug">
          <Link href={href} className="hover:text-brand-700">
            {product.name}
          </Link>
        </h3>
        <Rating value={product.rating} count={product.reviewCount} />
        <PriceDisplay price={product.price} mrp={product.mrp} size="sm" />
        {discount > 0 && <span className="sr-only">{discount} percent off</span>}
        <div className="mt-auto pt-2">
          <AddToCartButton product={product} size="sm" />
        </div>
      </div>
    </article>
  );
}
