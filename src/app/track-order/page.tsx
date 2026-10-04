import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackOrderForm } from "@/components/account/TrackOrderForm";
import { PageShell } from "@/components/layout/PageShell";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Track Your Order", description: "Check the status of your order using your order number.", path: "/track-order", noindex: true });

export default function TrackOrderPage() {
  return <PageShell title="Track Your Order" path="/track-order"><Suspense fallback={null}><TrackOrderForm /></Suspense></PageShell>;
}
