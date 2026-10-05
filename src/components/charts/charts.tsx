"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const CHART_COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#0ea5e9", "#f43f5e", "#8b5cf6", "#64748b"];

export type Series = { key: string; label: string; color?: string };
export type Point = { label: string } & Record<string, number | string>;

const fmt = (kind: "money" | "number") => (v: number) =>
  kind === "money"
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: Math.abs(v) >= 10000 ? "compact" : "standard", maximumFractionDigits: Math.abs(v) >= 10000 ? 1 : 0 }).format(v)
    : new Intl.NumberFormat("en-US", { notation: v >= 10000 ? "compact" : "standard" }).format(v);

type SeriesProps = { data: Point[]; series: Series[]; kind?: "area" | "bar" | "line"; format?: "money" | "number"; height?: number; stacked?: boolean };

export function TimeSeriesChart({ data, series, kind = "area", format = "number", height = 260, stacked }: SeriesProps) {
  const f = fmt(format);
  const axis = { stroke: "#94a3b8", fontSize: 11, tickLine: false, axisLine: false } as const;
  const common = { data, margin: { top: 8, right: 8, left: 0, bottom: 0 } };
  const body = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
      <XAxis dataKey="label" {...axis} minTickGap={24} />
      <YAxis {...axis} width={52} tickFormatter={(v) => f(Number(v))} allowDecimals={false} />
      <Tooltip formatter={(v) => f(Number(v))} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
      {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
    </>
  );
  const color = (s: Series, i: number) => s.color ?? CHART_COLORS[i % CHART_COLORS.length]!;
  return (
    <div style={{ height }} role="img" aria-label={series.map((s) => s.label).join(", ") + " chart"}>
      <ResponsiveContainer width="100%" height="100%">
        {kind === "bar" ? (
          <BarChart {...common}>{body}{series.map((s, i) => <Bar key={s.key} dataKey={s.key} name={s.label} fill={color(s, i)} radius={[3, 3, 0, 0]} stackId={stacked ? "a" : undefined} />)}</BarChart>
        ) : kind === "line" ? (
          <LineChart {...common}>{body}{series.map((s, i) => <Line key={s.key} dataKey={s.key} name={s.label} stroke={color(s, i)} strokeWidth={2} dot={false} type="monotone" />)}</LineChart>
        ) : (
          <AreaChart {...common}>
            <defs>{series.map((s, i) => <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color(s, i)} stopOpacity={0.25} /><stop offset="95%" stopColor={color(s, i)} stopOpacity={0} /></linearGradient>)}</defs>
            {body}
            {series.map((s, i) => <Area key={s.key} dataKey={s.key} name={s.label} stroke={color(s, i)} strokeWidth={2} fill={`url(#g-${s.key})`} type="monotone" stackId={stacked ? "a" : undefined} />)}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ data, height = 240, format = "number" }: { data: { name: string; value: number }[]; height?: number; format?: "money" | "number" }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const f = fmt(format);
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div style={{ height, width: height }} className="shrink-0" role="img" aria-label="Distribution chart">
        <PieChart width={height} height={height}>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none">
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => f(Number(v))} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
        </PieChart>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-700"><span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />{d.name}</span>
            <span className="tabular-nums text-slate-500">{f(d.value)} <span className="text-xs">({total ? Math.round((d.value / total) * 100) : 0}%)</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
