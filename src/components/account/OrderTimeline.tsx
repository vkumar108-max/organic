import { cn } from "@/lib/format";
import { ORDER_STATUSES, type OrderStatus } from "@/types";

const labels: Record<(typeof ORDER_STATUSES)[number], string> = {
  placed: "Order Placed",
  payment_confirmed: "Payment Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

export const statusLabel = (status: OrderStatus) => (status === "cancelled" ? "Cancelled" : labels[status]);

/**
 * Renders the status the backend reports — nothing is simulated. Steps after the
 * current one stay greyed out; no invented timestamps or courier locations.
 */
export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") return <p className="rounded-lg bg-red-50 p-4 text-danger">This order was cancelled.</p>;
  const current = ORDER_STATUSES.indexOf(status);
  return (
    <ol className="space-y-0" aria-label="Order progress">
      {ORDER_STATUSES.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} className="relative flex gap-4 pb-6 last:pb-0" aria-current={active ? "step" : undefined}>
            {index < ORDER_STATUSES.length - 1 && <span className={cn("absolute left-[0.95rem] top-8 h-[calc(100%-1.5rem)] w-0.5", done ? "bg-brand-600" : "bg-line")} aria-hidden="true" />}
            <span className={cn("z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold", done && "border-brand-600 bg-brand-600 text-white", active && "border-brand-600 bg-white text-brand-700 ring-4 ring-brand-100", !done && !active && "border-line bg-white text-ink-soft")}>
              {done ? "✓" : index + 1}
            </span>
            <div className="pt-1">
              <p className={cn("font-medium", !done && !active && "text-ink-soft")}>{labels[step]}</p>
              {active && <p className="text-sm text-brand-700">Current status</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
