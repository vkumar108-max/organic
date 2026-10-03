"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { ProductImage } from "@/components/product/ProductImage";
import { mainNav } from "@/config/site";
import { cn } from "@/lib/format";
import { toneFor } from "@/lib/tone";
import type { Category, Product } from "@/types";

const defaultLinks = [{ label: "All" }, { label: "Popular Products", query: "sort=popular" }, { label: "New Arrivals", query: "sort=newest" }];

/** Desktop navigation row + accessible mega menu (hover, click, focus and Escape all work). */
export function MegaMenu({ categories, featured }: { categories: Category[]; featured: Product | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => setOpen(false), [pathname]);

  const openNow = () => { clearTimeout(closeTimer.current); setOpen(true); };
  const closeSoon = () => { closeTimer.current = setTimeout(() => setOpen(false), 140); };

  return (
    <nav aria-label="Main" className="hidden border-t border-line md:block">
      <ul className="container-page flex items-center gap-1 text-[0.95rem] font-medium">
        {mainNav.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          if (!("mega" in item)) {
            return (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive ? "page" : undefined} className={cn("relative block px-4 py-3 hover:text-brand-700", isActive && "text-brand-700")}>
                  {item.label}
                  {isActive && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded bg-brand-600" />}
                </Link>
              </li>
            );
          }
          return (
            <li
              key={item.href}
              ref={wrapper}
              className="static"
              onMouseEnter={openNow}
              onMouseLeave={closeSoon}
              onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
              onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setOpen(false)}
            >
              <div className="flex items-center">
                <Link href={item.href} className={cn("py-3 pl-4 hover:text-brand-700", isActive && "text-brand-700")}>{item.label}</Link>
                <button type="button" aria-expanded={open} aria-controls="mega-menu" aria-label="Show shop categories" onClick={() => setOpen((value) => !value)} className="px-2 py-3 hover:text-brand-700">
                  <Icon name="chevronDown" size={16} className={cn("transition-transform", open && "rotate-180")} />
                </button>
              </div>
              <div
                id="mega-menu"
                hidden={!open}
                className="absolute inset-x-0 top-full z-40 border-b border-line bg-white shadow-lift"
              >
                <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_17rem]">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-3">
                    {categories.map((category) => (
                      <div key={category.id}>
                        <Link href={`/category/${category.slug}`} className="font-display text-sm font-bold uppercase tracking-wide text-brand-800 hover:underline">{category.name}</Link>
                        <ul className="mt-2 space-y-1.5">
                          {(category.menuLinks ?? defaultLinks).map((link) => (
                            <li key={link.label}>
                              <Link href={`/category/${category.slug}${link.query ? `?${link.query}` : ""}`} className="text-sm text-ink-soft hover:text-brand-700 hover:underline">
                                {link.label === "All" ? `All ${category.name}` : link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {featured && (
                    <Link href={`/product/${featured.slug}`} className="group flex flex-col overflow-hidden rounded-card border border-line bg-brand-50/60 hover:shadow-card">
                      <div className="relative aspect-[4/3]">
                        <ProductImage image={featured.images[0]} tone={toneFor(featured)} sizes="272px" />
                      </div>
                      <div className="space-y-1 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-clay-500">Featured product</p>
                        <p className="font-semibold group-hover:text-brand-700">{featured.name}</p>
                        <PriceDisplay price={featured.price} mrp={featured.mrp} size="sm" showBadge={false} />
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
