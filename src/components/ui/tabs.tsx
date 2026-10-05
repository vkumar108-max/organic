import Link from "next/link";
import { cn } from "@/lib/utils";

/** URL-driven tabs (?tab=key) so detail pages stay server-rendered and linkable. */
export function Tabs({ items, active, basePath }: { items: { key: string; label: string; count?: number }[]; active: string; basePath: string }) {
  return (
    <div className="mb-5 overflow-x-auto border-b border-slate-200">
      <nav className="-mb-px flex gap-6" aria-label="Tabs">
        {items.map((t) => (
          <Link
            key={t.key}
            href={`${basePath}?tab=${t.key}`}
            scroll={false}
            aria-current={active === t.key ? "page" : undefined}
            className={cn("whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium", active === t.key ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700")}
          >
            {t.label}
            {t.count != null && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{t.count}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
