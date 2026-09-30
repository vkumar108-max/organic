"use client";

import { OrderSummaryCard } from "@/components/account/OrderSummaryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDemoOrders } from "@/store/orders";

export default function OrdersPage() {
  const orders = useDemoOrders((state) => state.orders);
  return (
    <section aria-labelledby="orders-title">
      <h2 id="orders-title" className="mb-5 text-2xl font-semibold">My Orders</h2>
      {orders.length === 0 ? (
        <EmptyState icon="box" title="No orders yet" description="When you place an order it will show up here." action={{ label: "Start shopping", href: "/shop" }} />
      ) : (
        <ul className="space-y-4">{orders.map((order) => <li key={order.id}><OrderSummaryCard order={order} showTimeline /></li>)}</ul>
      )}
    </section>
  );
}
