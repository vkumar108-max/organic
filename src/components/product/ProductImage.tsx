import Image from "next/image";
import { ProductArt } from "@/components/ui/ProductArt";
import type { ProductImage as ProductImageType, ProductTone } from "@/types";

interface ProductImageProps {
  image: ProductImageType;
  tone: ProductTone;
  variant?: number;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** Real photo through next/image (AVIF/WebP, lazy) or generated placeholder art. */
export function ProductImage({ image, tone, variant = 0, sizes, priority = false, className = "" }: ProductImageProps) {
  if (!image.src) return <ProductArt tone={tone} variant={variant} label={image.alt} className={`h-full w-full ${className}`} />;
  return <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />;
}
