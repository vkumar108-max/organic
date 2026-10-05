import { requirePermission } from "@/server/rbac/context";
import { parseRange, rangeWindow } from "@/server/analytics/range";
import { TIME_METRICS, growthTrends } from "@/server/analytics/registry";
import { getOrdersByStatus, getPlanDistribution, getTopStores } from "@/server/analytics/metrics";
import { PageHeader, Card, CardBody, CardHeader } from "@/components/ui/card";
import { RangeFilter } from "@/components/charts/range-filter";
import { MetricCard } from "@/components/charts/metric-card";
import { DonutChart, TimeSeriesChart } from "@/components/charts/charts";
import { EmptyState } from "@/components/ui/states";
import { MiniTable, Td } from "@/features/shared/ui";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requirePermission("analytics.view");
  const range = parseRange((await searchParams).range);
  const win = rangeWindow(range);
  const ids = ["revenue", "gmv", "orders", "sellers", "stores", "customers"] as const;
  const [series, subs, growth, plans, byStatus, top] = await Promise.all([
    Promise.all(ids.map((id) => TIME_METRICS[id]!.load(win))),
    TIME_METRICS.subscriptions!.load(win),
    growthTrends(win),
    getPlanDistribution(),
    getOrdersByStatus(),
    getTopStores(8),
  ]);
  return (
    <>
      <PageHeader title="Analytics" description="Live platform metrics computed from the database." actions={<RangeFilter basePath="/analytics" active={range} />} />
      <div className="grid gap-6 lg:grid-cols-2">
        {ids.map((id, i) => <MetricCard key={id} metric={TIME_METRICS[id]!} data={series[i]!} />)}
        <MetricCard metric={TIME_METRICS.subscriptions!} data={subs} />
        <Card>
          <CardHeader title="Growth trends" description="Cumulative platform totals" />
          <CardBody><TimeSeriesChart kind="line" data={growth} series={[{ key: "sellers", label: "Sellers" }, { key: "stores", label: "Stores", color: "#f59e0b" }, { key: "customers", label: "Customers", color: "#f43f5e" }]} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Plan distribution" description="Live subscriptions by plan" />
          <CardBody>{plans.length ? <DonutChart data={plans} /> : <EmptyState title="No subscriptions" />}</CardBody>
        </Card>
        <Card>
          <CardHeader title="Orders by status" description="All time" />
          <CardBody>{byStatus.length ? <DonutChart data={byStatus} /> : <EmptyState title="No orders" />}</CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Top stores by sales" description="Paid orders, all time" />
          {top.length === 0 ? <EmptyState title="No sales yet" /> : (
            <MiniTable head={["#", "Store", "Seller", "Paid orders", "Sales"]}>
              {top.map((t, i) => <tr key={t.store.id}><Td>{i + 1}</Td><Td className="font-medium text-slate-900">{t.store.name}</Td><Td>{t.store.seller.name}</Td><Td>{t.orders}</Td><Td>{formatMoney(t.revenue)}</Td></tr>)}
            </MiniTable>
          )}
        </Card>
      </div>
    </>
  );
}
