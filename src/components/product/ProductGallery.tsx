"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/format";
import type { ProductImage as ProductImageType, ProductTone } from "@/types";
import { ProductImage } from "./ProductImage";

interface ProductGalleryProps {
  images: ProductImageType[];
  tone: ProductTone;
  productName: string;
}

/**
 * - Swipe: native scroll-snap carousel (works on touch without gesture code)
 * - Thumbnails + arrow keys for desktop
 * - Hover zoom on pointer devices
 * - Fullscreen viewer built on <dialog>
 */
export function ProductGallery({ images, tone, productName }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const goTo = useCallback(
    (next: number) => {
      const target = (next + images.length) % images.length;
      setIndex(target);
      const element = track.current;
      if (element) element.scrollTo({ left: element.clientWidth * target, behavior: "smooth" });
    },
    [images.length],
  );

  const onScroll = () => {
    const element = track.current;
    if (!element) return;
    const next = Math.round(element.scrollLeft / element.clientWidth);
    if (next !== index) setIndex(next);
  };

  const zoom = (event: MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--zx", `${((event.clientX - box.left) / box.width) * 100}%`);
    event.currentTarget.style.setProperty("--zy", `${((event.clientY - box.top) / box.height) * 100}%`);
  };

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (fullscreen && !element.open) element.showModal();
    if (!fullscreen && element.open) element.close();
  }, [fullscreen]);

  const onKey = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") goTo(index + 1);
    if (event.key === "ArrowLeft") goTo(index - 1);
  };

  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-40 lg:self-start" onKeyDown={onKey}>
      <div className="relative">
        <div
          ref={track}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-card border border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-roledescription="carousel"
          aria-label={`${productName} images`}
        >
          {images.map((image, position) => (
            <div
              key={position}
              role="group"
              aria-roledescription="slide"
              aria-label={`Image ${position + 1} of ${images.length}`}
              onMouseMove={zoom}
              className="group relative aspect-square w-full shrink-0 snap-center overflow-hidden bg-brand-50 md:cursor-zoom-in"
              onClick={() => setFullscreen(true)}
            >
              <div className="h-full w-full transition-transform duration-200 md:group-hover:scale-[2]" style={{ transformOrigin: "var(--zx,50%) var(--zy,50%)" }}>
                <ProductImage image={image} tone={tone} variant={position} sizes="(min-width:1024px) 45vw, 100vw" priority={position === 0} />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/95 shadow-md hover:bg-white"
          aria-label="Open fullscreen image viewer"
        >
          <Icon name="expand" size={18} />
        </button>
        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden" aria-hidden="true">
            {images.map((_, position) => (
              <span key={position} className={cn("h-1.5 rounded-full bg-white/90 shadow transition-all", position === index ? "w-5" : "w-1.5 opacity-70")} />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <ul className="grid grid-cols-4 gap-2 sm:gap-3">
          {images.map((image, position) => (
            <li key={position}>
              <button
                type="button"
                onClick={() => goTo(position)}
                aria-label={`Show image ${position + 1}`}
                aria-current={position === index}
                className={cn("relative block aspect-square w-full overflow-hidden rounded-lg border-2 bg-brand-50", position === index ? "border-brand-600" : "border-transparent hover:border-brand-300")}
              >
                <ProductImage image={image} tone={tone} variant={position} sizes="120px" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialog}
        onClose={() => setFullscreen(false)}
        onKeyDown={onKey}
        aria-label={`${productName} fullscreen viewer`}
        className="m-0 h-dvh max-h-dvh w-screen max-w-none bg-black/95 p-0 text-white"
      >
        {fullscreen && (
          <div className="relative grid h-full w-full place-items-center p-4">
            <div className="relative aspect-square h-full max-h-[85dvh] w-full max-w-[85dvh] overflow-hidden rounded-xl">
              <ProductImage image={images[index]} tone={tone} variant={index} sizes="100vw" />
            </div>
            <button type="button" onClick={() => setFullscreen(false)} aria-label="Close viewer" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 hover:bg-white/25">
              <Icon name="close" />
            </button>
            {images.length > 1 && (
              <>
                <button type="button" onClick={() => goTo(index - 1)} aria-label="Previous image" className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/15 hover:bg-white/25">
                  <Icon name="chevronLeft" />
                </button>
                <button type="button" onClick={() => goTo(index + 1)} aria-label="Next image" className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/15 hover:bg-white/25">
                  <Icon name="chevronRight" />
                </button>
              </>
            )}
            <p className="absolute bottom-4 text-sm" aria-live="polite">{index + 1} / {images.length}</p>
          </div>
        )}
      </dialog>
    </div>
  );
}
