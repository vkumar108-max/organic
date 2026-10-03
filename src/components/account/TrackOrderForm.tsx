"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { site } from "@/config/site";
import { fieldErrors, trackSchema } from "@/lib/validation";
import { useDemoOrders } from "@/store/orders";
import type { Order } from "@/types";
import { OrderSummaryCard } from "./OrderSummaryCard";

type Result = { kind: "found"; order: Order } | { kind: "notfound" } | { kind: "unavailable"; message: string } | null;

export function TrackOrderForm() {
  const initialOrder = useSearchParams().get("order") ?? "";
  const demoOrders = useDemoOrders((state) => state.orders);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = trackSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setLoading(true);
    const { orderId, contact } = parsed.data;
    try {
      if (site.dataMode === "demo") {
        // Demo orders exist only in this browser; the server has no order database.
        const needle = contact.toLowerCase();
        const match = demoOrders.find((order) => order.id.toLowerCase() === orderId.toLowerCase() && (order.customer.email.toLowerCase() === needle || order.customer.mobile === contact));
        setResult(match ? { kind: "found", order: match } : { kind: "notfound" });
        return;
      }
      const response = await fetch("/api/orders/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const data = await response.json();
      if (response.status === 404) setResult({ kind: "notfound" });
      else if (!response.ok) setResult({ kind: "unavailable", message: data?.error?.message ?? "Tracking is unavailable right now." });
      else setResult({ kind: "found", order: data as Order });
    } catch {
      setResult({ kind: "unavailable", message: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[22rem_1fr]">
      <form onSubmit={submit} noValidate className="h-fit space-y-4 rounded-card border border-line p-5">
        <FormField label="Order number" name="orderId" defaultValue={initialOrder} required error={errors.orderId} placeholder="e.g. DEMO-K3F9A1" />
        <FormField label="Email or mobile used at checkout" name="contact" required error={errors.contact} />
        <Button type="submit" full disabled={loading}>{loading ? "Looking up…" : "Track order"}</Button>
      </form>
      <div aria-live="polite">
        {result?.kind === "found" && <OrderSummaryCard order={result.order} showTimeline />}
        {result?.kind === "notfound" && <EmptyState icon="search" title="Order not found" description="Check the order number and the email or mobile you used at checkout, then try again." />}
        {result?.kind === "unavailable" && <EmptyState icon="wifiOff" title="Tracking unavailable" description={result.message} />}
        {!result && <EmptyState icon="package" title="Track your order" description="Enter your order number and contact details to see the current status. Live courier tracking appears here once shipping is connected." />}
      </div>
    </div>
  );
}
