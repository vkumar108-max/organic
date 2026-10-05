import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { requirePermission } from "@/server/rbac/context";
import { parseListParams, type RawSearchParams } from "@/lib/list-params";
import { listPayments, PAYMENT_SORTABLE } from "@/server/payments/queries";
import { db } from "@/server/db";
import { PageHeader } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/data/data-table";
import { FilterBar } from "@/components/data/filter-bar";
import { DetailDrawer } from "@/components/data/detail-drawer";
import { DetailList } from "@/components/data/detail-list";
import { StatusBadge } from "@/components/ui/badge";
import { humanize } from "@/config/statuses";
import { formatDateTime, formatMoney } from "@/lib/format";
import { EntityLink, Mono, Stat } from "@/features/shared/ui";

export const metadata = { title: "Payments" };

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const ctx = await requirePermission("payments.view");
  const params = parseListParams(await searchParams, { sortable: PAYMENT_SORTABLE, defaultSort: "createdAt", filters: ["status", "method", "store"] });
  const [{ rows, total, totals }, stores] = await Promise.all([listPayments(params), db.store.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })]);
  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    { key: "code", header: "Payment ID", sort: "code", mobile: "title", cell: (p) => <Mono>{p.code}</Mono> },
    { key: "order", header: "Order", cell: (p) => ctx.can("orders.view") ? <EntityLink href={`/orders/${p.order.id}`}>{p.order.number}</EntityLink> : p.order.number },
    { key: "store", header: "Store", cell: (p) => p.order.store.name },
    { key: "seller", header: "Seller", cell: (p) => p.order.store.seller.name },
    { key: "customer", header: "Customer", cell: (p) => p.order.customer.name },
    { key: "amount", header: "Amount", sort: "amount", cell: (p) => formatMoney(p.amount, { currency: p.currency }) },
    { key: "method", header: "Method", sort: "method", cell: (p) => humanize(p.method) },
    { key: "status", header: "Status", sort: "status", cell: (p) => <StatusBadge status={p.status} /> },
    { key: "ref", header: "Transaction ref", cell: (p) => <Mono>{p.transactionRef ?? "—"}</Mono> },
    { key: "createdAt", header: "Date", sort: "createdAt", cell: (p) => formatDateTime(p.createdAt) },
    { key: "inspect", header: "", mobile: "actions", sticky: true, className: "text-right", cell: (p) => (
      <DetailDrawer label="Inspect" title={`Payment ${p.code}`} description="Transaction record. Gateway secrets and card data are never stored or displayed.">
        <DetailList columns={1} items={[
          { label: "Status", value: <StatusBadge status={p.status} /> }, { label: "Amount", value: formatMoney(p.amount, { currency: p.currency }) },
          { label: "Method", value: humanize(p.method) }, { label: "Gateway", value: p.gateway }, { label: "Transaction reference", value: <Mono>{p.transactionRef ?? "—"}</Mono> },
          { label: "Failure reason", value: p.failureReason }, { label: "Order", value: p.order.number }, { label: "Store", value: p.order.store.name },
          { label: "Seller", value: p.order.store.seller.name }, { label: "Customer", value: `${p.order.customer.name} · ${p.order.customer.email}` },
          { label: "Created", value: formatDateTime(p.createdAt) }, { label: "Last updated", value: formatDateTime(p.updatedAt) },
        ]} />
      </DetailDrawer>) },
  ];
  return (
    <>
      <PageHeader title="Payments" description="Customer payment records across all stores." />
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(["PAID", "PENDING", "FAILED", "REFUNDED"] as const).map((s) => <Stat key={s} label={humanize(s)} value={formatMoney(totals[s] ?? 0)} hint="Matching current filters" />)}
      </div>
      <FilterBar searchPlaceholder="Search payment ID, order or transaction ref…" filters={[
        { name: "status", label: "Status", options: Object.values(PaymentStatus).map((v) => ({ value: v, label: humanize(v) })) },
        { name: "method", label: "Method", options: Object.values(PaymentMethod).map((v) => ({ value: v, label: humanize(v) })) },
        { name: "store", label: "Store", options: stores.map((s) => ({ value: s.id, label: s.name })) },
      ]} />
      <DataTable columns={columns} rows={rows} rowKey={(p) => p.id} params={params} basePath="/payments" total={total} emptyTitle="No payments found" />
    </>
  );
}
