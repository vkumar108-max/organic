import "server-only";
import { countSeries, gmvSeries, mergeSeries, revenueSeries } from "./series";
import type { RangeWindow } from "./range";
import type { Point, Series } from "@/components/charts/charts";

export type TimeMetric = {
  id: string;
  title: string;
  description: string;
  kind: "area" | "bar" | "line";
  format: "money" | "number";
  series: Series[];
  stacked?: boolean;
  /** Series key summed for the headline number. `last` = use the final point (cumulative metrics). */
  headline: { key: string; mode: "sum" | "last"; label: string };
  load: (win: RangeWindow) => Promise<Point[]>;
};

/**
 * Add a new analytics chart by appending one entry here; the Analytics page and (selectively) the
 * Overview render from this registry. Every `load` runs against the database.
 */
export const TIME_METRICS: Record<string, TimeMetric> = {
  revenue: {
    id: "revenue", title: "Platform revenue", description: "Paid subscription invoices + commission on completed payouts",
    kind: "area", format: "money", stacked: true, series: [{ key: "subscriptions", label: "Subscriptions" }, { key: "commission", label: "Commission", color: "#10b981" }],
    headline: { key: "total", mode: "sum", label: "Revenue in period" }, load: revenueSeries,
  },
  gmv: {
    id: "gmv", title: "Gross merchandise value", description: "Paid customer payments across all stores",
    kind: "area", format: "money", series: [{ key: "gmv", label: "GMV", color: "#0ea5e9" }], headline: { key: "gmv", mode: "sum", label: "GMV in period" }, load: gmvSeries,
  },
  orders: {
    id: "orders", title: "Orders", description: "Orders placed",
    kind: "bar", format: "number", series: [{ key: "value", label: "Orders" }], headline: { key: "value", mode: "sum", label: "Orders in period" }, load: (w) => countSeries("orders", w),
  },
  sellers: {
    id: "sellers", title: "New sellers", description: "Seller registrations",
    kind: "bar", format: "number", series: [{ key: "value", label: "New sellers", color: "#8b5cf6" }], headline: { key: "value", mode: "sum", label: "New in period" }, load: (w) => countSeries("sellers", w),
  },
  stores: {
    id: "stores", title: "New stores", description: "Stores created",
    kind: "bar", format: "number", series: [{ key: "value", label: "New stores", color: "#f59e0b" }], headline: { key: "value", mode: "sum", label: "New in period" }, load: (w) => countSeries("stores", w),
  },
  customers: {
    id: "customers", title: "New customers", description: "Customer registrations across stores",
    kind: "bar", format: "number", series: [{ key: "value", label: "New customers", color: "#f43f5e" }], headline: { key: "value", mode: "sum", label: "New in period" }, load: (w) => countSeries("customers", w),
  },
  subscriptions: {
    id: "subscriptions", title: "Subscription growth", description: "Total subscriptions created to date",
    kind: "line", format: "number", series: [{ key: "value", label: "Subscriptions", color: "#4f46e5" }], headline: { key: "value", mode: "last", label: "Total at end of period" }, load: (w) => countSeries("subscriptions", w, { cumulative: true }),
  },
};

export const headlineValue = (m: TimeMetric, data: Point[]) =>
  m.headline.mode === "last" ? Number(data.at(-1)?.[m.headline.key] ?? 0) : data.reduce((s, p) => s + Number(p[m.headline.key] ?? 0), 0);

/** Combined cumulative growth chart (sellers, stores, customers). */
export async function growthTrends(win: RangeWindow) {
  const [a, b, c] = await Promise.all([countSeries("sellers", win, { cumulative: true }), countSeries("stores", win, { cumulative: true }), countSeries("customers", win, { cumulative: true })]);
  return mergeSeries(a.map((p) => ({ label: p.label, sellers: p.value! })), b.map((p) => ({ label: p.label, stores: p.value! })), c.map((p) => ({ label: p.label, customers: p.value! })));
}
