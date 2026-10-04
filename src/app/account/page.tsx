"use client";

import Link from "next/link";
import { useDemoOrders } from "@/store/orders";
import { useAuth } from "@/store/auth";
import { useWishlist } from "@/store/wishlist";

export default function DashboardPage() {
  const user = useAuth((state) => state.user);
  const orders = useDemoOrders((state) => state.orders);
  const wishlistCount = useWishlist((state) => state.slugs.length);
  const cards = [
    { label: "Orders", value: orders.length, href: "/account/orders" },
    { label: "Wishlist items", value: wishlistCount, href: "/wishlist" },
    { label: "Track an order", value: "→", href: "/track-order" },
  ];
  return (
    <section aria-labelledby="dash">
      <h2 id="dash" className="text-2xl font-semibold">Hello, {user?.name.split(" ")[0]}</h2>
      <p className="mt-1 text-ink-soft">Here’s a quick look at your account.</p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <li key={card.label}><Link href={card.href} className="block rounded-card border border-line bg-brand-50/60 p-5 hover:shadow-card"><p className="font-display text-3xl font-semibold">{card.value}</p><p className="text-sm text-ink-soft">{card.label}</p></Link></li>
        ))}
      </ul>
      {user?.demo && <p className="mt-6 rounded-lg bg-sand-50 p-4 text-sm text-clay-600">You’re in demo mode. Order history, addresses and details are stored only in this browser until the account backend is connected.</p>}
    </section>
  );
}
