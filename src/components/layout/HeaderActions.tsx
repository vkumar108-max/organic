"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { selectCartCount, useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import { useAuth } from "@/store/auth";
import { useWishlist } from "@/store/wishlist";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-clay-500 px-1 text-[0.7rem] font-bold text-white" aria-hidden="true">{count > 99 ? "99+" : count}</span>;
}

function Action({ href, icon, label, count = 0, showLabel }: { href: string; icon: IconName; label: string; count?: number; showLabel?: boolean }) {
  return (
    <Link href={href} className="relative flex items-center gap-2 rounded-full p-2 hover:bg-brand-50" aria-label={count > 0 ? `${label}, ${count} item${count > 1 ? "s" : ""}` : label}>
      <span className="relative"><Icon name={icon} size={24} /><Badge count={count} /></span>
      {showLabel && <span className="hidden text-sm font-medium xl:inline">{label}</span>}
    </Link>
  );
}

/** Desktop: account, wishlist, cart. Mobile: search, cart, account (kept minimal). */
export function HeaderActions() {
  const cartCount = useCart(selectCartCount);
  const wishCount = useWishlist((state) => state.slugs.length);
  const user = useAuth((state) => state.user);
  const setSearchOpen = useUi((state) => state.setSearchOpen);

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <button type="button" onClick={() => setSearchOpen(true)} className="rounded-full p-2 hover:bg-brand-50 md:hidden" aria-label="Open search">
        <Icon name="search" size={24} />
      </button>
      <div className="hidden md:block"><Action href="/account" icon="user" label={user ? user.name.split(" ")[0] : "Account"} showLabel /></div>
      <div className="hidden md:block"><Action href="/wishlist" icon="heart" label="Wishlist" count={wishCount} showLabel /></div>
      <Action href="/cart" icon="cart" label="Cart" count={cartCount} showLabel />
      <div className="md:hidden"><Action href="/account" icon="user" label="Account" /></div>
    </div>
  );
}
