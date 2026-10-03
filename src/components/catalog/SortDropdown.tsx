"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { sortLabels } from "@/lib/catalog-params";
import type { ProductSort } from "@/types";

/** Native <select> — best mobile UX and fully accessible. Updates ?sort= */
export function SortDropdown({ current }: { current?: ProductSort }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const onChange = (value: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("sort", value);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor="sort" className="whitespace-nowrap text-ink-soft">Sort by</label>
      <select id="sort" value={current ?? ""} onChange={(event) => onChange(event.target.value)} className="min-h-10 rounded-full border border-line bg-white px-4 font-medium">
        {!current && <option value="" disabled>Relevance</option>}
        {(Object.keys(sortLabels) as ProductSort[]).map((key) => <option key={key} value={key}>{sortLabels[key]}</option>)}
      </select>
    </div>
  );
}
