import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Payment failed", robots: { index: false, follow: false } };

export default function PaymentFailedPage() {
  return (
    <div className="container-page py-10">
      <EmptyState icon="alert" title="Payment didn’t go through" description="Your payment was not completed and you have not been charged for a failed attempt. Your cart is still saved — you can try again or choose Cash on Delivery." action={{ label: "Try again", href: "/checkout" }} secondary={{ label: "Back to cart", href: "/cart" }} />
    </div>
  );
}
