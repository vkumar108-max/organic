import { cn } from "@/lib/utils";
import { STATUS_TONES, humanize, type Tone } from "@/config/statuses";

const tones: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  gray: "bg-slate-100 text-slate-600 ring-slate-500/20",
  purple: "bg-violet-50 text-violet-700 ring-violet-600/20",
  slate: "bg-slate-200 text-slate-700 ring-slate-500/20",
};

export function Badge({ tone = "gray", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap", tones[tone], className)}>{children}</span>;
}

/** Single renderer for every enum status in the product. */
export function StatusBadge({ status, label }: { status: string | boolean; label?: string }) {
  const key = String(status);
  return <Badge tone={STATUS_TONES[key] ?? "gray"}>{label ?? (typeof status === "boolean" ? (status ? "Active" : "Inactive") : humanize(key))}</Badge>;
}
