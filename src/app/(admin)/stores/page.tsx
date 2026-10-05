import { StoreStatus } from "@prisma/client";
import { requirePermission } from "@/server/rbac/context";
import { parseListParams, type RawSearchParams } from "@/lib/list-params";
import { listStores, STORE_SORTABLE } from "@/server/stores/queries";
import { storeUrl } from "@/server/stores/url";
import { db } from "@/server/db";
import { PageHeader } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/data/data-table";
import { FilterBar } from "@/components/data/filter-bar";
import { RowActions } from "@/components/data/action-dialog";
import { StatusBadge } from "@/components/ui/badge";
import { humanize } from "@/config/statuses";
import { formatDate } from "@/lib/format";
import { Cell2, EntityLink, Mono } from "@/features/shared/ui";
import { storeActions } from "@/features/stores/store-actions";

export const metadata = { title: "Stores" };

export default async function StoresPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const ctx = await requirePermission("stores.view");
  const params = parseListParams(await searchParams, { sortable: STORE_SORTABLE, defaultSort: "createdAt", filters: ["status", "category", "theme"] });
  const [{ rows, total }, categories, themes] = await Promise.all([
    listStores(params),
    db.store.findMany({ distinct: ["category"], select: { category: true }, orderBy: { category: "asc" } }),
    db.theme.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const manage = ctx.can("stores.manage");
  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    { key: "name", header: "Store", sort: "name", mobile: "title", cell: (s) => <Cell2 primary={<EntityLink href={`/stores/${s.id}`}>{s.name}</EntityLink>} secondary={<Mono>{storeUrl(s.slug).replace("https://", "")}</Mono>} /> },
    { key: "owner", header: "Owner", cell: (s) => ctx.can("sellers.view") ? <EntityLink href={`/sellers/${s.seller.id}`}>{s.seller.name}</EntityLink> : s.seller.name },
    { key: "category", header: "Category", sort: "category", cell: (s) => s.category },
    { key: "plan", header: "Plan", cell: (s) => s.seller.plan?.name ?? "—" },
    { key: "theme", header: "Theme", cell: (s) => s.theme?.name ?? "—" },
    { key: "status", header: "Status", sort: "status", cell: (s) => <StatusBadge status={s.status} /> },
    { key: "createdAt", header: "Created", sort: "createdAt", cell: (s) => formatDate(s.createdAt) },
    { key: "actions", header: "", mobile: "actions", sticky: true, className: "w-10 text-right", cell: (s) => <RowActions actions={storeActions(s, manage)} extra={[{ label: "View store", href: `/stores/${s.id}` }, { label: "Open preview ↗", href: storeUrl(s.slug) }]} /> },
  ];
  return (
    <>
      <PageHeader title="Stores" description="All seller stores on the platform." />
      <FilterBar searchPlaceholder="Search store, slug or owner…" filters={[
        { name: "status", label: "Status", options: Object.values(StoreStatus).map((v) => ({ value: v, label: humanize(v) })) },
        { name: "category", label: "Category", options: categories.map((c) => ({ value: c.category, label: c.category })) },
        { name: "theme", label: "Theme", options: themes.map((t) => ({ value: t.id, label: t.name })) },
      ]} />
      <DataTable columns={columns} rows={rows} rowKey={(s) => s.id} params={params} basePath="/stores" total={total} emptyTitle="No stores found" />
    </>
  );
}
