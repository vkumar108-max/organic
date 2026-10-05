export const RANGES = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
  { key: "1y", label: "1 Year" },
] as const;

export type RangeKey = (typeof RANGES)[number]["key"];
export type Bucket = "hour" | "day" | "month";

export const parseRange = (v: string | string[] | undefined): RangeKey => {
  const s = Array.isArray(v) ? v[0] : v;
  return RANGES.some((r) => r.key === s) ? (s as RangeKey) : "30d";
};

export type RangeWindow = { key: RangeKey; from: Date; to: Date; bucket: Bucket; buckets: { start: Date; label: string }[] };

const startOfDayUtc = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
const addUtc = (d: Date, unit: Bucket, n: number) =>
  unit === "hour" ? new Date(d.getTime() + n * 3600_000)
  : unit === "day" ? new Date(d.getTime() + n * 86400_000)
  : new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));

const label = (d: Date, b: Bucket) =>
  b === "hour" ? `${String(d.getUTCHours()).padStart(2, "0")}:00`
  : b === "day" ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(d)
  : new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }).format(d);

/** Resolve a range key into UTC bucket boundaries. Pure function (testable). */
export function rangeWindow(key: RangeKey, now = new Date()): RangeWindow {
  const today = startOfDayUtc(now);
  let bucket: Bucket = "day";
  let from: Date;
  if (key === "today") { bucket = "hour"; from = today; }
  else if (key === "7d") from = addUtc(today, "day", -6);
  else if (key === "30d") from = addUtc(today, "day", -29);
  else if (key === "90d") from = addUtc(today, "day", -89);
  else { bucket = "month"; from = addUtc(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)), "month", -11); }

  const buckets: RangeWindow["buckets"] = [];
  for (let d = from; d <= now; d = addUtc(d, bucket, 1)) buckets.push({ start: d, label: label(d, bucket) });
  return { key, from, to: now, bucket, buckets };
}
