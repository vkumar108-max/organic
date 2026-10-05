import Link from "next/link";
import { RANGES, type RangeKey } from "@/server/analytics/range";
import { cn } from "@/lib/utils";

/** Server-rendered date-range pills (URL param `range`). Keeps other params. */
export function RangeFilter({ basePath, active, extra = {} }: { basePath: string; active: RangeKey; extra?: Record<string, string> }) {
  return (
    <div role="group" aria-label="Date range" className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-sm">
      {RANGES.map((r) => {
        const sp = new URLSearchParams({ ...extra, range: r.key });
        return (
          <Link key={r.key} href={`${basePath}?${sp}`} scroll={false} aria-current={active === r.key ? "true" : undefined}
            className={cn("rounded-md px-3 py-1.5 text-xs font-medium", active === r.key ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
            {r.label}
          </Link>
        );
      })}
    </div>
  );
}
