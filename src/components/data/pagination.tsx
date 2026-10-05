import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { listHref, type ListParams } from "@/lib/list-params";
import { cn } from "@/lib/utils";

export function Pagination({ basePath, params, total }: { basePath: string; params: ListParams; total: number }) {
  const pages = Math.max(1, Math.ceil(total / params.pageSize));
  const from = total === 0 ? 0 : (params.page - 1) * params.pageSize + 1;
  const to = Math.min(total, params.page * params.pageSize);
  const btn = "inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-700 hover:bg-slate-50";
  const off = "pointer-events-none opacity-40";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-4 py-3 text-sm text-slate-500">
      <p>Showing <span className="font-medium text-slate-700">{from}–{to}</span> of <span className="font-medium text-slate-700">{total.toLocaleString("en-US")}</span></p>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">Page {params.page} of {pages}</span>
        <Link aria-label="Previous page" aria-disabled={params.page <= 1} className={cn(btn, params.page <= 1 && off)} href={listHref(basePath, params, { page: params.page - 1 })}><ChevronLeft className="h-4 w-4" />Prev</Link>
        <Link aria-label="Next page" aria-disabled={params.page >= pages} className={cn(btn, params.page >= pages && off)} href={listHref(basePath, params, { page: params.page + 1 })}>Next<ChevronRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}
