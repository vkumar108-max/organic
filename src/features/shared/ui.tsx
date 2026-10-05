import Link from "next/link";
import { formatDateTime, timeAgo } from "@/lib/format";
import { EmptyState } from "@/components/ui/states";
import type { AuditLog } from "@prisma/client";

export const EntityLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="font-medium text-brand-700 hover:underline">{children}</Link>
);

export const Cell2 = ({ primary, secondary }: { primary: React.ReactNode; secondary?: React.ReactNode }) => (
  <div className="min-w-0"><div className="truncate font-medium text-slate-900">{primary}</div>{secondary && <div className="truncate text-xs text-slate-500">{secondary}</div>}</div>
);

export const Mono = ({ children }: { children: React.ReactNode }) => <span className="font-mono text-xs text-slate-600">{children}</span>;

export function ActivityList({ items, emptyTitle = "No activity yet" }: { items: Pick<AuditLog, "id" | "action" | "description" | "actorEmail" | "createdAt">[]; emptyTitle?: string }) {
  if (!items.length) return <EmptyState title={emptyTitle} />;
  return (
    <ol className="divide-y divide-slate-100">
      {items.map((a) => (
        <li key={a.id} className="flex items-start gap-3 px-5 py-3">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-800">{a.description}</p>
            <p className="mt-0.5 text-xs text-slate-500" title={formatDateTime(a.createdAt)}>{a.actorEmail ?? "System"} · {timeAgo(a.createdAt)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function MiniTable({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50"><tr>{head.map((h) => <th key={h} className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}
export const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <td className={`whitespace-nowrap px-4 py-2.5 text-slate-700 ${className}`}>{children}</td>;

/** Plain-text stat used in detail summaries. */
export const Stat = ({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">{value}</p>{hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}</div>
);
