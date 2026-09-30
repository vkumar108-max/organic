import type { Metadata } from "next";
import { CheckoutView } from "@/components/cart/CheckoutView";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return <PageShell title="Checkout" path="/checkout"><CheckoutView /></PageShell>;
}
