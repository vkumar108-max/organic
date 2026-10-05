"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input, Select } from "@/components/ui/form-controls";

export type FilterDef = { name: string; label: string; options: { value: string; label: string }[] };

/** URL-driven search + filters: the server page re-renders with new params, so state is shareable. */
export function FilterBar({ searchPlaceholder = "Search…", filters = [], showSearch = true }: { searchPlaceholder?: string; filters?: FilterDef[]; showSearch?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => { setQ(sp.get("q") ?? ""); }, [sp]);

  const update = (name: string, value: string) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(name, value); else next.delete(name);
    next.delete("page");
    start(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  const hasActive = Boolean(sp.get("q")) || filters.some((f) => sp.get(f.name));

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" role="search">
      {showSearch && (
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            aria-label="Search"
            value={q}
            placeholder={searchPlaceholder}
            className="pl-9"
            onChange={(e) => {
              setQ(e.target.value);
              clearTimeout(timer.current);
              timer.current = setTimeout(() => update("q", e.target.value.trim()), 350);
            }}
          />
        </div>
      )}
      {filters.map((f) => (
        <Select key={f.name} aria-label={f.label} className="w-auto min-w-[9rem]" value={sp.get(f.name) ?? ""} onChange={(e) => update(f.name, e.target.value)}>
          <option value="">{f.label}: All</option>
          {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      ))}
      {hasActive && (
        <button type="button" onClick={() => start(() => router.replace(pathname, { scroll: false }))} className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-sm text-slate-500 hover:text-slate-800">
          <X className="h-4 w-4" />Clear
        </button>
      )}
      {pending && <span className="text-xs text-slate-400" aria-live="polite">Updating…</span>}
    </div>
  );
}
