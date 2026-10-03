"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/format";
import { selectCartCount, useCart } from "@/store/cart";
import { useUi } from "@/store/ui";

const items: { label: string; href: string; icon: IconName }[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Categories", href: "/categories", icon: "grid" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const cartCount = useCart(selectCartCount);
  const setSearchOpen = useUi((state) => state.setSearchOpen);
  const tab = (active: boolean) => cn("relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.7rem] font-medium", active ? "text-brand-700" : "text-ink-soft");
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch">
        {items.map((item) => (
          <li key={item.href} className="flex flex-1">
            <Link href={item.href} className={tab(isActive(item.href))} aria-current={isActive(item.href) ? "page" : undefined}>
              <Icon name={item.icon} size={22} />{item.label}
            </Link>
          </li>
        ))}
        <li className="flex flex-1">
          <button type="button" onClick={() => setSearchOpen(true)} className={tab(false)}><Icon name="search" size={22} />Search</button>
        </li>
        <li className="flex flex-1">
          <Link href="/cart" className={tab(isActive("/cart"))} aria-current={isActive("/cart") ? "page" : undefined}>
            <span className="relative">
              <Icon name="cart" size={22} />
              {cartCount > 0 && <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-clay-500 px-1 text-[0.6rem] font-bold text-white">{cartCount}</span>}
            </span>
            Cart{cartCount > 0 && <span className="sr-only">, {cartCount} items</span>}
          </Link>
        </li>
        <li className="flex flex-1">
          <Link href="/account" className={tab(isActive("/account"))} aria-current={isActive("/account") ? "page" : undefined}>
            <Icon name="user" size={22} />Account
          </Link>
        </li>
      </ul>
    </nav>
  );
}
