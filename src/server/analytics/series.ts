import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "../db";
import type { RangeWindow } from "./range";
import type { Point } from "@/components/charts/charts";

/** Closed whitelist: identifiers are never built from user input. */
const COUNT_SOURCES = {
  sellers: { table: "Seller", date: "createdAt" },
  stores: { table: "Store", date: "createdAt" },
  orders: { table: "Order", date: "placedAt" },
  customers: { table: "Customer", date: "createdAt" },
  subscriptions: { table: "Subscription", date: "createdAt" },
  tickets: { table: "SupportTicket", date: "createdAt" },
} as const;

export type CountSource = keyof typeof COUNT_SOURCES;

type Row = { bucket: Date; value: number };

function fill(win: RangeWindow, rows: Row[], key = "value"): Point[] {
  const map = new Map(rows.map((r) => [new Date(r.bucket).getTime(), r.value]));
  return win.buckets.map((b) => ({ label: b.label, [key]: map.get(b.start.getTime()) ?? 0 }));
}

async function countRows(source: CountSource, win: RangeWindow): Promise<Row[]> {
  const { table, date } = COUNT_SOURCES[source];
  const rows = await db.$queryRaw<{ bucket: Date; value: number }[]>(Prisma.sql`
    SELECT date_trunc(${win.bucket}, ${Prisma.raw(`"${date}"`)}) AS bucket, COUNT(*)::int AS value
    FROM ${Prisma.raw(`"${table}"`)}
    WHERE ${Prisma.raw(`"${date}"`)} >= ${win.from} AND ${Prisma.raw(`"${date}"`)} <= ${win.to}
    GROUP BY 1`);
  return rows;
}

/** Count of records created per bucket; `cumulative` adds the running platform total. */
export async function countSeries(source: CountSource, win: RangeWindow, opts: { cumulative?: boolean } = {}): Promise<Point[]> {
  const rows = await countRows(source, win);
  const points = fill(win, rows);
  if (!opts.cumulative) return points;
  const { table, date } = COUNT_SOURCES[source];
  const base = await db.$queryRaw<{ n: number }[]>(Prisma.sql`SELECT COUNT(*)::int AS n FROM ${Prisma.raw(`"${table}"`)} WHERE ${Prisma.raw(`"${date}"`)} < ${win.from}`);
  let running = base[0]?.n ?? 0;
  return points.map((p) => ({ label: p.label, value: (running += Number(p.value)) }));
}

/** Platform revenue per bucket: paid subscription invoices + commission on completed payouts. */
export async function revenueSeries(win: RangeWindow): Promise<Point[]> {
  const [subs, commission] = await Promise.all([
    db.$queryRaw<Row[]>(Prisma.sql`
      SELECT date_trunc(${win.bucket}, "paidAt") AS bucket, COALESCE(SUM(amount),0)::float AS value
      FROM "SubscriptionInvoice" WHERE status = 'PAID' AND "paidAt" >= ${win.from} AND "paidAt" <= ${win.to} GROUP BY 1`),
    db.$queryRaw<Row[]>(Prisma.sql`
      SELECT date_trunc(${win.bucket}, "completedAt") AS bucket, COALESCE(SUM(commission),0)::float AS value
      FROM "Payout" WHERE status = 'COMPLETED' AND "completedAt" >= ${win.from} AND "completedAt" <= ${win.to} GROUP BY 1`),
  ]);
  const a = fill(win, subs, "subscriptions");
  const b = fill(win, commission, "commission");
  return a.map((p, i) => ({ ...p, commission: b[i]!.commission!, total: Number(p.subscriptions) + Number(b[i]!.commission) }));
}

/** Gross merchandise value (paid customer payments) per bucket — seller-side sales volume. */
export async function gmvSeries(win: RangeWindow): Promise<Point[]> {
  const rows = await db.$queryRaw<Row[]>(Prisma.sql`
    SELECT date_trunc(${win.bucket}, "createdAt") AS bucket, COALESCE(SUM(amount),0)::float AS value
    FROM "Payment" WHERE status = 'PAID' AND "createdAt" >= ${win.from} AND "createdAt" <= ${win.to} GROUP BY 1`);
  return fill(win, rows, "gmv");
}

export function mergeSeries(...parts: Point[][]): Point[] {
  return parts[0]!.map((p, i) => Object.assign({}, ...parts.map((part) => part[i]!)) as Point);
}
