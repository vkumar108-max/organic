"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useDemoOrders } from "@/store/orders";
import { OrderSummaryCard } from "./OrderSummaryCard";

export function OrderSuccess() {
  const orderId = useSearchParams().get("order") ?? "";
  const order = useDemoOrders((state) => state.orders.find((candidate) => candidate.id === orderId));
  return (
    <div className="container-page max-w-2xl py-12 text-center">
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-brand-700"><Icon name="check" size={32} /></div>
      <h1 className="text-3xl font-semibold">Thank you — your order is placed</h1>
      {orderId && <p className="mt-2 text-ink-soft">Order number: <strong className="text-ink">{orderId}</strong></p>}
      <p className="mt-2 text-ink-soft">A confirmation will be sent to your email once the store backend is connected.</p>
      {order && <div className="mt-8 text-left"><OrderSummaryCard order={order} /></div>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href={`/track-order?order=${encodeURIComponent(orderId)}`}>Track order</Button>
        <Button href="/shop" variant="outline">Continue shopping</Button>
      </div>
    </div>
  );
}
