import { SellerStatus } from "@prisma/client";
import { requirePermission } from "@/server/rbac/context";
import { parseListParams, type RawSearchParams } from "@/lib/list-params";
import { listSellers, SELLER_SORTABLE } from "@/server/sellers/queries";
import { db } from "@/server/db";
import { PageHeader } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/data/data-table";
import { FilterBar } from "@/components/data/filter-bar";
import { RowActions } from "@/components/data/action-dialog";
import { StatusBadge } from "@/components/ui/badge";
import { humanize } from "@/config/statuses";
import { formatDate, timeAgo } from "@/lib/format";
import { Cell2, EntityLink, Mono } from "@/features/shared/ui";
import { sellerActions } from "@/features/sellers/seller-actions";

export const metadata = { title: "Sellers" };

export default async function SellersPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const ctx = await requirePermission("sellers.view");
  const params = parseListParams(await searchParams, { sortable: SELLER_SORTABLE, defaultSort: "createdAt", filters: ["status", "plan"] });
  const [{ rows, total }, plans] = await Promise.all([listSellers(params), db.plan.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, key: true, name: true, isActive: true } })]);
  const opts = { canManage: ctx.can("sellers.manage"), canChangePlan: ctx.can("sellers.manage") && ctx.can("subscriptions.manage"), plans: plans.filter((p) => p.isActive) };

  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    { key: "code", header: "Seller ID", sort: "code", cell: (s) => <Mono>{s.code}</Mono>, mobile: "hide" },
    { key: "name", header: "Seller", sort: "name", mobile: "title", cell: (s) => <Cell2 primary={<EntityLink href={`/sellers/${s.id}`}>{s.name}</EntityLink>} secondary={s.businessName} /> },
    { key: "email", header: "Email", cell: (s) => <span className="block max-w-[14rem] truncate" title={s.email}>{s.email}</span> },
    { key: "store", header: "Store", cell: (s) => s._count.stores === 0 ? <span className="text-slate-400">No store</span> : <span>{s.stores[0]!.name}{s._count.stores > 1 && <span className="text-slate-400"> +{s._count.stores - 1}</span>}</span> },
    { key: "plan", header: "Plan", cell: (s) => s.plan?.name ?? "—" },
    { key: "status", header: "Status", sort: "status", cell: (s) => <StatusBadge status={s.status} /> },
    { key: "createdAt", header: "Registered", sort: "createdAt", cell: (s) => formatDate(s.createdAt) },
    { key: "lastActivityAt", header: "Last activity", sort: "lastActivityAt", cell: (s) => timeAgo(s.lastActivityAt) },
    { key: "actions", header: "", mobile: "actions", sticky: true, className: "w-10 text-right", cell: (s) => <RowActions actions={sellerActions(s, opts)} extra={[{ label: "View seller", href: `/sellers/${s.id}` }]} /> },
  ];

  return (
    <>
      <PageHeader title="Sellers" description="Review applications, manage account status and plans." />
      <FilterBar searchPlaceholder="Search name, email, ID or store…" filters={[
        { name: "status", label: "Status", options: Object.values(SellerStatus).map((v) => ({ value: v, label: humanize(v) })) },
        { name: "plan", label: "Plan", options: plans.map((p) => ({ value: p.key, label: p.name })) },
      ]} />
      <DataTable columns={columns} rows={rows} rowKey={(s) => s.id} params={params} basePath="/sellers" total={total} emptyTitle="No sellers found" />
    </>
  );
}
