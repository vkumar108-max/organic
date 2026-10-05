import { TicketPriority, TicketStatus } from "@prisma/client";
import { requirePermission } from "@/server/rbac/context";
import { parseListParams, type RawSearchParams } from "@/lib/list-params";
import { listAssignableAdmins, listTickets, TICKET_SORTABLE } from "@/server/support/queries";
import { db } from "@/server/db";
import { PageHeader } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/data/data-table";
import { FilterBar } from "@/components/data/filter-bar";
import { RowActions } from "@/components/data/action-dialog";
import { StatusBadge } from "@/components/ui/badge";
import { humanize } from "@/config/statuses";
import { formatDate, timeAgo } from "@/lib/format";
import { Cell2, EntityLink, Mono } from "@/features/shared/ui";
import { ticketActions } from "@/features/support/ticket-actions";

export const metadata = { title: "Support" };

export default async function SupportPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const ctx = await requirePermission("support.view");
  const params = parseListParams(await searchParams, { sortable: TICKET_SORTABLE, defaultSort: "updatedAt", filters: ["status", "priority", "category", "assignee"] });
  const [{ rows, total }, admins, cats] = await Promise.all([listTickets(params, ctx.user.id), listAssignableAdmins(), db.supportTicket.findMany({ distinct: ["category"], select: { category: true }, orderBy: { category: "asc" } })]);
  const manage = ctx.can("support.manage");
  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    { key: "code", header: "Ticket", sort: "code", mobile: "hide", cell: (t) => <Mono>{t.code}</Mono> },
    { key: "subject", header: "Subject", sort: "subject", mobile: "title", cell: (t) => <Cell2 primary={<EntityLink href={`/support/${t.id}`}>{t.subject}</EntityLink>} secondary={t.code} /> },
    { key: "seller", header: "Seller", cell: (t) => t.seller.name },
    { key: "store", header: "Store", cell: (t) => t.store?.name ?? "—" },
    { key: "category", header: "Category", cell: (t) => t.category },
    { key: "priority", header: "Priority", sort: "priority", cell: (t) => <StatusBadge status={t.priority} /> },
    { key: "assignee", header: "Assigned to", cell: (t) => t.assignedTo?.name ?? <span className="text-slate-400">Unassigned</span> },
    { key: "status", header: "Status", sort: "status", cell: (t) => <StatusBadge status={t.status} /> },
    { key: "createdAt", header: "Created", sort: "createdAt", cell: (t) => formatDate(t.createdAt) },
    { key: "updatedAt", header: "Updated", sort: "updatedAt", cell: (t) => timeAgo(t.updatedAt) },
    { key: "actions", header: "", mobile: "actions", sticky: true, className: "w-10 text-right", cell: (t) => <RowActions actions={ticketActions(t, manage, admins)} extra={[{ label: "View ticket", href: `/support/${t.id}` }]} /> },
  ];
  return (
    <>
      <PageHeader title="Support" description="Seller support tickets." />
      <FilterBar searchPlaceholder="Search ticket ID, subject or seller…" filters={[
        { name: "status", label: "Status", options: Object.values(TicketStatus).map((v) => ({ value: v, label: humanize(v) })) },
        { name: "priority", label: "Priority", options: Object.values(TicketPriority).map((v) => ({ value: v, label: humanize(v) })) },
        { name: "category", label: "Category", options: cats.map((c) => ({ value: c.category, label: c.category })) },
        { name: "assignee", label: "Assignee", options: [{ value: "me", label: "Assigned to me" }, { value: "none", label: "Unassigned" }] },
      ]} />
      <DataTable columns={columns} rows={rows} rowKey={(t) => t.id} params={params} basePath="/support" total={total} emptyTitle="No tickets found" />
    </>
  );
}
