"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { Modal } from "@/components/ui/Modal";
import { footerLinks, mainNav } from "@/config/site";
import { useUi } from "@/store/ui";
import type { Category } from "@/types";

/** Hamburger drawer. Uses the shared Modal (native dialog) in drawer mode. */
export function MobileMenu({ categories }: { categories: Category[] }) {
  const open = useUi((state) => state.menuOpen);
  const setOpen = useUi((state) => state.setMenuOpen);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname, setOpen]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-full p-2 hover:bg-brand-50 md:hidden" aria-label="Open menu" aria-haspopup="dialog">
        <Icon name="menu" size={26} />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Menu" variant="drawer">
        <nav aria-label="Mobile" className="-mt-2 flex flex-col gap-5">
          <Logo />
          <ul className="divide-y divide-line">
            {mainNav.filter((item) => item.href !== "/categories").map((item) => (
              <li key={item.href}><Link href={item.href} className="block py-3 font-medium">{item.label}</Link></li>
            ))}
          </ul>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-clay-500">Shop by category</p>
            <ul>
              {categories.map((category) => (
                <li key={category.id}><Link href={`/category/${category.slug}`} className="flex items-center justify-between py-2.5">{category.name}<Icon name="chevronRight" size={16} /></Link></li>
              ))}
            </ul>
          </div>
          <ul className="grid grid-cols-2 gap-2 text-sm text-ink-soft">
            {[...footerLinks.support.slice(0, 3), { label: "Wishlist", href: "/wishlist" }].map((link) => (
              <li key={link.href}><Link href={link.href} className="block rounded-lg bg-brand-50 px-3 py-2">{link.label}</Link></li>
            ))}
          </ul>
        </nav>
      </Modal>
    </>
  );
}
