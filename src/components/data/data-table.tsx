import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { Pagination } from "./pagination";
import { listHref, type ListParams } from "@/lib/list-params";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Sort key (must be in the page's `sortable` whitelist). */
  sort?: string;
  className?: string;
  /** Pin to the right edge while scrolling horizontally (use for action columns). */
  sticky?: boolean;
  /** Mobile card placement: title (card heading), actions (top-right), hide. Default: label/value row. */
  mobile?: "title" | "actions" | "hide";
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  params: ListParams;
  basePath: string;
  total: number;
  emptyTitle?: string;
  emptyDescription?: string;
};

/** Server-rendered table: scrollable table on md+, stacked cards below. Both come from one column definition. */
export function DataTable<T>({ columns, rows, rowKey, params, basePath, total, emptyTitle = "No results", emptyDescription = "Try adjusting your search or filters." }: Props<T>) {
  if (rows.length === 0) {
    return <Card><EmptyState title={emptyTitle} description={emptyDescription} /></Card>;
  }
  const titleCol = columns.find((c) => c.mobile === "title") ?? columns[0]!;
  const actionCol = columns.find((c) => c.mobile === "actions");
  const bodyCols = columns.filter((c) => c !== titleCol && c !== actionCol && c.mobile !== "hide");

  return (
    <Card className="overflow-hidden">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((c) => {
                const active = c.sort && params.sort === c.sort;
                const nextDir = active && params.dir === "asc" ? "desc" : "asc";
                return (
                  <th key={c.key} scope="col" aria-sort={active ? (params.dir === "asc" ? "ascending" : "descending") : undefined} className={cn("whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500", c.sticky && "sticky right-0 bg-slate-50", c.className)}>
                    {c.sort ? (
                      <Link href={listHref(basePath, params, { sort: c.sort, dir: nextDir, page: 1 })} className="inline-flex items-center gap-1 hover:text-slate-800">
                        {c.header}
                        {active ? (params.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ChevronsUpDown className="h-3 w-3 opacity-40" />}
                      </Link>
                    ) : c.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((r) => (
              <tr key={rowKey(r)} className="group hover:bg-slate-50/60">
                {columns.map((c) => <td key={c.key} className={cn("px-3 py-3 align-middle text-slate-700", c.sticky && "sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.08)]", c.className)}>{c.cell(r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {rows.map((r) => (
          <li key={rowKey(r)} className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 font-medium text-slate-900">{titleCol.cell(r)}</div>
              {actionCol && <div className="shrink-0">{actionCol.cell(r)}</div>}
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {bodyCols.map((c) => (
                <div key={c.key} className="min-w-0">
                  <dt className="text-xs text-slate-500">{c.header}</dt>
                  <dd className="truncate text-slate-800">{c.cell(r)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      <Pagination basePath={basePath} params={params} total={total} />
    </Card>
  );
}
