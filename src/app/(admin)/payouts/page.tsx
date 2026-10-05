import { PayoutStatus } from "@prisma/client";
import { requirePermission } from "@/server/rbac/context";
import { parseListParams, type RawSearchParams } from "@/lib/list-params";
import { listPayouts, PAYOUT_SORTABLE } from "@/server/payouts/queries";
import { PageHeader } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/data/data-table";
import { FilterBar } from "@/components/data/filter-bar";
import { RowActions } from "@/components/data/action-dialog";
import { DetailDrawer } from "@/components/data/detail-drawer";
import { DetailList } from "@/components/data/detail-list";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { humanize } from "@/config/statuses";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { EntityLink, Mono, Stat } from "@/features/shared/ui";
import { payoutActions } from "@/features/payouts/payout-actions";

export const metadata = { title: "Payouts" };

export default async function PayoutsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const ctx = await requirePermission("payouts.view");
  const params = parseListParams(await searchParams, { sortable: PAYOUT_SORTABLE, defaultSort: "requestedAt", filters: ["status"] });
  const { rows, total, sums } = await listPayouts(params);
  const manage = ctx.can("payouts.manage");
  const sum = (s: PayoutStatus) => sums.find((x) => x.status === s);
  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    { key: "code", header: "Payout ID", sort: "code", mobile: "title", cell: (p) => <Mono>{p.code}</Mono> },
    { key: "seller", header: "Seller", cell: (p) => ctx.can("sellers.view") ? <EntityLink href={`/sellers/${p.seller.id}`}>{p.seller.name}</EntityLink> : p.seller.name },
    { key: "store", header: "Store", cell: (p) => p.store?.name ?? "All stores" },
    { key: "gross", header: "Gross", sort: "grossAmount", cell: (p) => formatMoney(p.grossAmount) },
    { key: "commission", header: "Commission", sort: "commission", cell: (p) => formatMoney(p.commission) },
    { key: "net", header: "Net payout", sort: "netAmount", cell: (p) => <span className="font-medium">{formatMoney(p.netAmount)}</span> },
    { key: "status", header: "Status", sort: "status", cell: (p) => <span className="flex items-center gap-1.5"><StatusBadge status={p.status} />{p.status === "PENDING" && p.approvedAt && <Badge tone="blue">Approved</Badge>}</span> },
    { key: "requestedAt", header: "Requested", sort: "requestedAt", cell: (p) => formatDate(p.requestedAt) },
    { key: "processedAt", header: "Processed", sort: "processedAt", cell: (p) => formatDate(p.processedAt) },
    { key: "actions", header: "", mobile: "actions", sticky: true, className: "text-right", cell: (p) => (
      <div className="flex items-center justify-end gap-1">
        <DetailDrawer label="View" title={`Payout ${p.code}`}>
          <DetailList columns={1} items={[
            { label: "Seller", value: p.seller.name }, { label: "Store", value: p.store?.name ?? "All stores" }, { label: "Status", value: <StatusBadge status={p.status} /> },
            { label: "Gross amount", value: formatMoney(p.grossAmount) }, { label: "Platform commission", value: formatMoney(p.commission) }, { label: "Net payout", value: formatMoney(p.netAmount) },
            { label: "Requested", value: formatDateTime(p.requestedAt) }, { label: "Approved", value: formatDateTime(p.approvedAt) }, { label: "Processed", value: formatDateTime(p.processedAt) },
            { label: "Completed", value: formatDateTime(p.completedAt) }, { label: "Reference", value: p.reference }, { label: "Failure reason", value: p.failureReason },
          ]} />
        </DetailDrawer>
        <RowActions actions={payoutActions(p, manage)} />
      </div>) },
  ];
  return (
    <>
      <PageHeader title="Payouts" description="Seller settlements. Financial actions require the payouts.manage permission and are audited." />
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Pending" value={formatMoney(sum("PENDING")?._sum.netAmount)} hint={`${sum("PENDING")?._count ?? 0} payouts`} />
        <Stat label="Processing" value={formatMoney(sum("PROCESSING")?._sum.netAmount)} hint={`${sum("PROCESSING")?._count ?? 0} payouts`} />
        <Stat label="Completed" value={formatMoney(sum("COMPLETED")?._sum.netAmount)} hint={`${formatMoney(sum("COMPLETED")?._sum.commission)} commission earned`} />
        <Stat label="Failed" value={formatMoney(sum("FAILED")?._sum.netAmount)} hint={`${sum("FAILED")?._count ?? 0} payouts`} />
      </div>
      <FilterBar searchPlaceholder="Search payout ID, seller or store…" filters={[{ name: "status", label: "Status", options: Object.values(PayoutStatus).map((v) => ({ value: v, label: humanize(v) })) }]} />
      <DataTable columns={columns} rows={rows} rowKey={(p) => p.id} params={params} basePath="/payouts" total={total} emptyTitle="No payouts found" />
    </>
  );
}
