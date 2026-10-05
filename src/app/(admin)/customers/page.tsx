import { CustomerStatus } from "@prisma/client";
import { requirePermission } from "@/server/rbac/context";
import { parseListParams, type RawSearchParams } from "@/lib/list-params";
import { listCustomers, CUSTOMER_SORTABLE } from "@/server/customers/queries";
import { db } from "@/server/db";
import { PageHeader } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/data/data-table";
import { FilterBar } from "@/components/data/filter-bar";
import { StatusBadge } from "@/components/ui/badge";
import { humanize } from "@/config/statuses";
import { formatDate, formatMoney } from "@/lib/format";
import { Cell2, EntityLink } from "@/features/shared/ui";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const ctx = await requirePermission("customers.view");
  const params = parseListParams(await searchParams, { sortable: CUSTOMER_SORTABLE, defaultSort: "createdAt", filters: ["status", "store"] });
  const [{ rows, total }, stores] = await Promise.all([listCustomers(params), db.store.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })]);
  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    { key: "name", header: "Customer", sort: "name", mobile: "title", cell: (c) => <Cell2 primary={<EntityLink href={`/customers/${c.id}`}>{c.name}</EntityLink>} secondary={c.email} /> },
    { key: "email", header: "Email", sort: "email", mobile: "hide", cell: (c) => c.email },
    { key: "phone", header: "Phone", cell: (c) => c.phone ?? "—" },
    { key: "store", header: "Store", cell: (c) => ctx.can("stores.view") ? <EntityLink href={`/stores/${c.store.id}`}>{c.store.name}</EntityLink> : c.store.name },
    { key: "orders", header: "Orders", cell: (c) => c.totalOrders },
    { key: "spend", header: "Total spending", cell: (c) => formatMoney(c.totalSpend) },
    { key: "createdAt", header: "Registered", sort: "createdAt", cell: (c) => formatDate(c.createdAt) },
    { key: "status", header: "Status", sort: "status", cell: (c) => <StatusBadge status={c.status} /> },
  ];
  return (
    <>
      <PageHeader title="Customers" description="Shoppers across all stores (platform-level, read-only)." />
      <FilterBar searchPlaceholder="Search name, email or phone…" filters={[
        { name: "store", label: "Store", options: stores.map((s) => ({ value: s.id, label: s.name })) },
        { name: "status", label: "Status", options: Object.values(CustomerStatus).map((v) => ({ value: v, label: humanize(v) })) },
      ]} />
      <DataTable columns={columns} rows={rows} rowKey={(c) => c.id} params={params} basePath="/customers" total={total} emptyTitle="No customers found" />
    </>
  );
}
