import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = { title: "Your Cart", robots: { index: false, follow: false } };

export default function CartPage() {
  return <PageShell title="Your Cart" path="/cart"><CartView /></PageShell>;
}
