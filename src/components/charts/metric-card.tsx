import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { TimeSeriesChart } from "./charts";
import { formatMoney, formatNumber } from "@/lib/format";
import { headlineValue, type TimeMetric } from "@/server/analytics/registry";
import type { Point } from "./charts";

export function MetricCard({ metric, data, height = 240, className }: { metric: TimeMetric; data: Point[]; height?: number; className?: string }) {
  const v = headlineValue(metric, data);
  return (
    <Card className={className}>
      <CardHeader title={metric.title} description={metric.description}
        action={<div className="text-right"><p className="text-lg font-semibold tabular-nums text-slate-900">{metric.format === "money" ? formatMoney(v, { compact: v >= 100000 }) : formatNumber(v)}</p><p className="text-xs text-slate-500">{metric.headline.label}</p></div>} />
      <CardBody><TimeSeriesChart data={data} series={metric.series} kind={metric.kind} format={metric.format} stacked={metric.stacked} height={height} /></CardBody>
    </Card>
  );
}
