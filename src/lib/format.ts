import { CURRENCY } from "@/config/app";

type Numeric = number | string | { toString(): string } | null | undefined;
const num = (v: Numeric) => (v == null ? 0 : Number(v.toString()));

export const formatMoney = (v: Numeric, opts?: { compact?: boolean; currency?: string }) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: opts?.currency ?? CURRENCY,
    notation: opts?.compact ? "compact" : "standard",
    maximumFractionDigits: opts?.compact ? 1 : 2,
  }).format(num(v));

export const formatNumber = (v: Numeric, compact = false) =>
  new Intl.NumberFormat("en-US", { notation: compact ? "compact" : "standard", maximumFractionDigits: compact ? 1 : 0 }).format(num(v));

export const formatDate = (d: Date | string | null | undefined) =>
  d ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(d)) : "—";

export const formatDateTime = (d: Date | string | null | undefined) =>
  d
    ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(new Date(d)) + " UTC"
    : "—";

export function timeAgo(d: Date | string | null | undefined, now = new Date()): string {
  if (!d) return "—";
  const s = Math.round((now.getTime() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  const units: [number, string][] = [[60, "m"], [3600, "h"], [86400, "d"], [2592000, "mo"], [31536000, "y"]];
  let out = `${Math.floor(s / 60)}m`;
  for (const [secs, label] of units) if (s >= secs) out = `${Math.floor(s / secs)}${label}`;
  return `${out} ago`;
}

export const formatLimit = (v: number | null | undefined, unit = "") =>
  v == null ? "Unlimited" : `${formatNumber(v)}${unit}`;

export const formatStorage = (mb: number | null | undefined) =>
  mb == null ? "Unlimited" : mb >= 1024 ? `${+(mb / 1024).toFixed(1)} GB` : `${mb} MB`;

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
