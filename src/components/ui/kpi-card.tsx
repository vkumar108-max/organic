import Link from "next/link";
import { cn } from "@/lib/utils";

export function KpiCard({ label, value, hint, icon, href, tone = "brand" }: { label: string; value: string; hint?: string; icon?: React.ReactNode; href?: string; tone?: "brand" | "green" | "amber" | "sky" | "violet" | "rose" }) {
  const tones = { brand: "bg-brand-50 text-brand-600", green: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", sky: "bg-sky-50 text-sky-600", violet: "bg-violet-50 text-violet-600", rose: "bg-rose-50 text-rose-600" };
  const body = (
    <div className={cn("flex h-full items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card", href && "transition-shadow hover:shadow-md")}>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
      {icon && <div className={cn("rounded-lg p-2", tones[tone])}>{icon}</div>}
    </div>
  );
  return href ? <Link href={href} className="block">{body}</Link> : body;
}
