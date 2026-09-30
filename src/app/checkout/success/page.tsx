import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderSuccess } from "@/components/account/OrderSuccess";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false, follow: false } };

export default function SuccessPage() {
  return <Suspense fallback={null}><OrderSuccess /></Suspense>;
}
