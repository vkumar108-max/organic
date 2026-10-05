import { requirePermission } from "@/server/rbac/context";
import { parseListParams, type RawSearchParams } from "@/lib/list-params";
import { auditFilterOptions, listAuditLogs, AUDIT_SORTABLE } from "@/server/audit/queries";
import { PageHeader } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/data/data-table";
import { FilterBar } from "@/components/data/filter-bar";
import { DetailDrawer } from "@/components/data/detail-drawer";
import { DetailList } from "@/components/data/detail-list";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { Mono } from "@/features/shared/ui";

export const metadata = { title: "Audit Logs" };

const toneFor = (a: string) => (/(blocked|rejected|suspended|disabled|failed|cancelled|deleted)/.test(a) ? "red" : /(approved|created|published|activated|completed|login$|reactivated)/.test(a) ? "green" : "gray");

export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  await requirePermission("audit.view");
  const params = parseListParams(await searchParams, { sortable: AUDIT_SORTABLE, defaultSort: "createdAt", filters: ["action", "actor", "target", "period"], pageSize: 25 });
  const [{ rows, total }, opts] = await Promise.all([listAuditLogs(params), auditFilterOptions()]);
  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    { key: "createdAt", header: "Timestamp", sort: "createdAt", mobile: "title", cell: (a) => <span className="whitespace-nowrap">{formatDateTime(a.createdAt)}</span> },
    { key: "actor", header: "Actor", cell: (a) => a.actorEmail ?? <span className="text-slate-400">System / anonymous</span> },
    { key: "action", header: "Action", sort: "action", cell: (a) => <Badge tone={toneFor(a.action)}>{a.action}</Badge> },
    { key: "target", header: "Target", cell: (a) => a.targetType ? <span>{a.targetType} <Mono>{a.targetId?.slice(0, 10)}</Mono></span> : "—" },
    { key: "description", header: "Description", className: "max-w-md", cell: (a) => <span className="line-clamp-2">{a.description}</span> },
    { key: "ip", header: "IP", cell: (a) => <Mono>{a.ip ?? "—"}</Mono> },
    { key: "details", header: "", mobile: "actions", sticky: true, className: "text-right", cell: (a) => (
      <DetailDrawer label="Details" title={a.action} description={formatDateTime(a.createdAt)}>
        <DetailList columns={1} items={[
          { label: "Actor", value: a.actorEmail ?? "System / anonymous" }, { label: "Description", value: a.description },
          { label: "Target", value: a.targetType ? `${a.targetType} · ${a.targetId}` : "—" }, { label: "IP address", value: a.ip }, { label: "User agent", value: a.userAgent },
          { label: "Metadata", value: a.metadata ? <pre className="max-h-72 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{JSON.stringify(a.metadata, null, 2)}</pre> : "—" },
        ]} />
      </DetailDrawer>) },
  ];
  return (
    <>
      <PageHeader title="Audit logs" description="Append-only record of administrative activity. Entries can't be edited or deleted." />
      <FilterBar searchPlaceholder="Search description, actor, target ID or IP…" filters={[
        { name: "period", label: "Period", options: [["today", "Last 24 hours"], ["7d", "Last 7 days"], ["30d", "Last 30 days"], ["90d", "Last 90 days"], ["1y", "Last year"]].map(([value, label]) => ({ value: value!, label: label! })) },
        { name: "action", label: "Action", options: opts.prefixes.map((p) => ({ value: `${p}.*`, label: `${p}.*` })) },
        { name: "actor", label: "Actor", options: opts.actors.map((u) => ({ value: u.id, label: u.name })) },
        { name: "target", label: "Target", options: opts.targets.map((t) => ({ value: t, label: t })) },
      ]} />
      <DataTable columns={columns} rows={rows} rowKey={(a) => a.id} params={params} basePath="/audit-logs" total={total} emptyTitle="No audit entries match" />
    </>
  );
}
