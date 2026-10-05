import { Banknote, Boxes, CreditCard, Repeat, Receipt, Store, UserCheck, UserSquare2, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/server/rbac/context";
import { db } from "@/server/db";
import { parseRange, rangeWindow } from "@/server/analytics/range";
import { TIME_METRICS } from "@/server/analytics/registry";
import { getKpis } from "@/server/analytics/metrics";
import { KpiCard } from "@/components/ui/kpi-card";
import { Card, CardHeader, PageHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { RangeFilter } from "@/components/charts/range-filter";
import { MetricCard } from "@/components/charts/metric-card";
import { ActivityList } from "@/features/shared/ui";
import { formatMoney, formatNumber, timeAgo } from "@/lib/format";
import type { Point } from "@/components/charts/charts";

export const metadata = { title: "Overview" };

function RecentList<T extends { id: string }>({ title, href, items, render }: { title: string; href?: string; items: T[]; render: (i: T) => React.ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} action={href ? <Link href={href} className="text-xs font-medium text-brand-700 hover:underline">View all</Link> : undefined} />
      {items.length === 0 ? <EmptyState title="Nothing yet" /> : <ul className="divide-y divide-slate-100">{items.map((i) => <li key={i.id} className="flex items-center justify-between gap-3 px-5 py-3">{render(i)}</li>)}</ul>}
    </Card>
  );
}
const Row = ({ primary, secondary, right }: { primary: React.ReactNode; secondary: React.ReactNode; right: React.ReactNode }) => (
  <><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{primary}</p><p className="truncate text-xs text-slate-500">{secondary}</p></div><div className="shrink-0">{right}</div></>
);

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const ctx = await requireUser();
  const range = parseRange((await searchParams).range);
  const win = rangeWindow(range);
  const can = { sellers: ctx.can("sellers.view"), stores: ctx.can("stores.view"), customers: ctx.can("customers.view"), orders: ctx.can("orders.view"), payments: ctx.can("payments.view"), subscriptions: ctx.can("subscriptions.view"), payouts: ctx.can("payouts.view"), support: ctx.can("support.view"), audit: ctx.can("audit.view"), analytics: ctx.can("analytics.view") };
  const chartIds = [can.analytics || can.payments ? "revenue" : null, can.sellers ? "sellers" : null, can.stores ? "stores" : null, can.orders ? "orders" : null, can.subscriptions ? "subscriptions" : null].filter(Boolean) as string[];

  const none = Promise.resolve([] as never[]);
  const [kpi, charts, recentSellers, recentStores, recentOrders, recentTickets, recentActivity] = await Promise.all([
    getKpis({ sellers: can.sellers, stores: can.stores, customers: can.customers, orders: can.orders, revenue: can.payments || can.analytics, subscriptions: can.subscriptions, payouts: can.payouts }),
    Promise.all(chartIds.map((id) => TIME_METRICS[id]!.load(win))) as Promise<Point[][]>,
    can.sellers ? db.seller.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { plan: { select: { name: true } } } }) : none,
    can.stores ? db.store.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { seller: { select: { name: true } } } }) : none,
    can.orders ? db.order.findMany({ orderBy: { placedAt: "desc" }, take: 5, include: { store: { select: { name: true } } } }) : none,
    can.support ? db.supportTicket.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { seller: { select: { name: true } } } }) : none,
    can.audit ? db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }) : none,
  ]);

  const kpis: React.ReactNode[] = [];
  if (kpi.sellers) kpis.push(<KpiCard key="s" label="Total sellers" value={formatNumber(kpi.sellers.total)} hint={`+${kpi.sellers.new30} in 30 days · ${kpi.sellers.pending} pending`} icon={<UserSquare2 className="h-5 w-5" />} href="/sellers" />, <KpiCard key="as" label="Active sellers" value={formatNumber(kpi.sellers.active)} icon={<UserCheck className="h-5 w-5" />} tone="green" href="/sellers?status=ACTIVE" />);
  if (kpi.stores) kpis.push(<KpiCard key="st" label="Total stores" value={formatNumber(kpi.stores.total)} hint={`+${kpi.stores.new30} in 30 days`} icon={<Store className="h-5 w-5" />} tone="sky" href="/stores" />, <KpiCard key="ast" label="Active stores" value={formatNumber(kpi.stores.active)} icon={<Store className="h-5 w-5" />} tone="green" href="/stores?status=ACTIVE" />);
  if (kpi.customers != null) kpis.push(<KpiCard key="c" label="Total customers" value={formatNumber(kpi.customers)} icon={<Users className="h-5 w-5" />} tone="violet" href="/customers" />);
  if (kpi.orders) kpis.push(<KpiCard key="o" label="Total orders" value={formatNumber(kpi.orders.total)} hint={`${formatNumber(kpi.orders.last30)} in last 30 days`} icon={<Boxes className="h-5 w-5" />} tone="amber" href="/orders" />);
  if (kpi.revenue) kpis.push(<KpiCard key="r" label="Total revenue" value={formatMoney(kpi.revenue.total, { compact: kpi.revenue.total >= 1e6 })} hint={`Subscriptions ${formatMoney(kpi.revenue.subscriptions, { compact: true })} · Commission ${formatMoney(kpi.revenue.commission, { compact: true })}`} icon={<Banknote className="h-5 w-5" />} tone="green" />);
  if (kpi.mrr != null) kpis.push(<KpiCard key="m" label="Monthly recurring revenue" value={formatMoney(kpi.mrr)} hint="Active subscriptions, normalised monthly" icon={<Repeat className="h-5 w-5" />} href="/subscriptions?status=ACTIVE" />);
  if (kpi.subscriptions) kpis.push(<KpiCard key="sub" label="Active subscriptions" value={formatNumber(kpi.subscriptions.active)} hint={`${kpi.subscriptions.trial} on trial`} icon={<Receipt className="h-5 w-5" />} tone="sky" href="/subscriptions" />);
  if (kpi.payouts) kpis.push(<KpiCard key="p" label="Pending payouts" value={formatMoney(kpi.payouts.amount)} hint={`${kpi.payouts.count} awaiting action`} icon={<Wallet className="h-5 w-5" />} tone="rose" href="/payouts?status=PENDING" />);
  if (kpi.revenue && kpis.length < 12) kpis.push(<KpiCard key="gmv" label="Seller sales (GMV)" value={formatMoney(kpi.revenue.gmv, { compact: kpi.revenue.gmv >= 1e6 })} hint="Paid customer payments, all stores" icon={<CreditCard className="h-5 w-5" />} tone="violet" />);

  return (
    <>
      <PageHeader title={`Welcome back, ${ctx.user.name.split(" ")[0]}`} description="Here's what's happening across the STORELAUNCH platform." actions={chartIds.length > 0 && <RangeFilter basePath="/" active={range} />} />
      {kpis.length > 0 && <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{kpis}</div>}

      {chartIds.length > 0 && (
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {chartIds.map((id, i) => <MetricCard key={id} metric={TIME_METRICS[id]!} data={charts[i]!} height={220} className={i === 0 ? "lg:col-span-2" : ""} />)}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {can.sellers && <RecentList title="Recent sellers" href="/sellers" items={recentSellers} render={(s) => <Row primary={<Link href={`/sellers/${s.id}`} className="hover:underline">{s.name}</Link>} secondary={`${s.plan?.name ?? "No plan"} · ${timeAgo(s.createdAt)}`} right={<StatusBadge status={s.status} />} />} />}
        {can.stores && <RecentList title="Recent stores" href="/stores" items={recentStores} render={(s) => <Row primary={<Link href={`/stores/${s.id}`} className="hover:underline">{s.name}</Link>} secondary={`${s.seller.name} · ${timeAgo(s.createdAt)}`} right={<StatusBadge status={s.status} />} />} />}
        {can.orders && <RecentList title="Recent orders" href="/orders" items={recentOrders} render={(o) => <Row primary={<Link href={`/orders/${o.id}`} className="hover:underline">{o.number}</Link>} secondary={`${o.store.name} · ${timeAgo(o.placedAt)}`} right={<span className="flex items-center gap-2 text-sm tabular-nums">{formatMoney(o.amount)}<StatusBadge status={o.status} /></span>} />} />}
        {can.support && <RecentList title="Recent support tickets" href="/support" items={recentTickets} render={(t) => <Row primary={<Link href={`/support/${t.id}`} className="hover:underline">{t.subject}</Link>} secondary={`${t.seller.name} · ${timeAgo(t.createdAt)}`} right={<span className="flex gap-1.5"><StatusBadge status={t.priority} /><StatusBadge status={t.status} /></span>} />} />}
        {can.audit && <Card className="lg:col-span-2"><CardHeader title="Recent admin activity" action={<Link href="/audit-logs" className="text-xs font-medium text-brand-700 hover:underline">View all</Link>} /><ActivityList items={recentActivity} /></Card>}
      </div>
      {kpis.length === 0 && !chartIds.length && <Card><EmptyState title="Welcome" description="Use the navigation to open the sections your role can access." /></Card>}
    </>
  );
}
