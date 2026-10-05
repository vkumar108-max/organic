import { OrderStatus, PaymentStatus } from "@prisma/client";
import { requirePermission } from "@/server/rbac/context";
import { parseListParams, type RawSearchParams } from "@/lib/list-params";
import { listOrders, ORDER_SORTABLE } from "@/server/orders/queries";
import { db } from "@/server/db";
import { PageHeader } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/data/data-table";
import { FilterBar } from "@/components/data/filter-bar";
import { StatusBadge } from "@/components/ui/badge";
import { humanize } from "@/config/statuses";
import { formatDateTime, formatMoney } from "@/lib/format";
import { EntityLink } from "@/features/shared/ui";

export const metadata = { title: "Orders" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const ctx = await requirePermission("orders.view");
  const params = parseListParams(await searchParams, { sortable: ORDER_SORTABLE, defaultSort: "placedAt", filters: ["status", "payment", "store", "seller"] });
  const [{ rows, total }, stores, sellers] = await Promise.all([
    listOrders(params),
    db.store.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.seller.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" }, where: { stores: { some: {} } } }),
  ]);
  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    { key: "number", header: "Order", sort: "number", mobile: "title", cell: (o) => <EntityLink href={`/orders/${o.id}`}>{o.number}</EntityLink> },
    { key: "store", header: "Store", cell: (o) => ctx.can("stores.view") ? <EntityLink href={`/stores/${o.store.id}`}>{o.store.name}</EntityLink> : o.store.name },
    { key: "seller", header: "Seller", cell: (o) => o.store.seller.name },
    { key: "customer", header: "Customer", cell: (o) => ctx.can("customers.view") ? <EntityLink href={`/customers/${o.customer.id}`}>{o.customer.name}</EntityLink> : o.customer.name },
    { key: "amount", header: "Amount", sort: "amount", cell: (o) => formatMoney(o.amount) },
    { key: "payment", header: "Payment", sort: "paymentStatus", cell: (o) => <StatusBadge status={o.paymentStatus} /> },
    { key: "status", header: "Order status", sort: "status", cell: (o) => <StatusBadge status={o.status} /> },
    { key: "placedAt", header: "Date", sort: "placedAt", cell: (o) => formatDateTime(o.placedAt) },
  ];
  return (
    <>
      <PageHeader title="Orders" description="Platform-wide order activity across all stores (read-only)." />
      <FilterBar searchPlaceholder="Search order #, customer or transaction…" filters={[
        { name: "store", label: "Store", options: stores.map((s) => ({ value: s.id, label: s.name })) },
        { name: "seller", label: "Seller", options: sellers.map((s) => ({ value: s.id, label: s.name })) },
        { name: "payment", label: "Payment", options: Object.values(PaymentStatus).map((v) => ({ value: v, label: humanize(v) })) },
        { name: "status", label: "Order status", options: Object.values(OrderStatus).map((v) => ({ value: v, label: humanize(v) })) },
      ]} />
      <DataTable columns={columns} rows={rows} rowKey={(o) => o.id} params={params} basePath="/orders" total={total} emptyTitle="No orders found" />
    </>
  );
}
