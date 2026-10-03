import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import type { Order } from "@/types";
import { OrderTimeline, statusLabel } from "./OrderTimeline";

export function OrderSummaryCard({ order, showTimeline = false }: { order: Order; showTimeline?: boolean }) {
  return (
    <article className="rounded-card border border-line bg-white p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-sans text-base font-semibold">Order {order.id}</h3>
          <p className="text-sm text-ink-soft">Placed {formatDate(order.createdAt)}</p>
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">{statusLabel(order.orderStatus)}</span>
      </header>
      {order.isDemo && <p className="mt-2 text-xs text-clay-600">Demo order — stored only in this browser.</p>}
      <ul className="mt-4 divide-y divide-line text-sm">
        {order.items.map((item) => (
          <li key={item.variantId} className="flex justify-between gap-3 py-2">
            <span><Link href={`/product/${item.slug}`} className="font-medium hover:text-brand-700">{item.name}</Link> <span className="text-ink-soft">({item.variantLabel}) × {item.quantity}</span></span>
            <span>{formatPrice(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
        <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
        {order.discount > 0 && <div className="flex justify-between text-brand-700"><dt>Discount</dt><dd>−{formatPrice(order.discount)}</dd></div>}
        <div className="flex justify-between"><dt className="text-ink-soft">Shipping</dt><dd>{order.shipping ? formatPrice(order.shipping) : "Free"}</dd></div>
        <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
        <div className="flex justify-between"><dt className="text-ink-soft">Payment</dt><dd className="capitalize">{order.paymentMethod === "cod" ? "Cash on delivery" : order.paymentMethod} · {order.paymentStatus}</dd></div>
      </dl>
      <p className="mt-3 text-sm text-ink-soft">Deliver to: {order.shippingAddress.fullName}, {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
      {showTimeline && <div className="mt-6"><OrderTimeline status={order.orderStatus} /></div>}
    </article>
  );
}
