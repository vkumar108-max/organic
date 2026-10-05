import { DomainStatus, DomainType, SslStatus } from "@prisma/client";
import { requirePermission } from "@/server/rbac/context";
import { parseListParams, type RawSearchParams } from "@/lib/list-params";
import { listDomains, DOMAIN_SORTABLE } from "@/server/domains/queries";
import { PageHeader } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/data/data-table";
import { FilterBar } from "@/components/data/filter-bar";
import { RowActions } from "@/components/data/action-dialog";
import { StatusBadge } from "@/components/ui/badge";
import { humanize } from "@/config/statuses";
import { formatDate } from "@/lib/format";
import { EntityLink } from "@/features/shared/ui";
import { domainActions } from "@/features/domains/domain-actions";

export const metadata = { title: "Domains" };

export default async function DomainsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const ctx = await requirePermission("domains.view");
  const params = parseListParams(await searchParams, { sortable: DOMAIN_SORTABLE, defaultSort: "createdAt", filters: ["status", "type", "ssl"] });
  const { rows, total } = await listDomains(params);
  const manage = ctx.can("domains.manage");
  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    { key: "hostname", header: "Domain", sort: "hostname", mobile: "title", cell: (d) => <span className="font-medium text-slate-900">{d.hostname}</span> },
    { key: "store", header: "Store", cell: (d) => ctx.can("stores.view") ? <EntityLink href={`/stores/${d.store.id}`}>{d.store.name}</EntityLink> : d.store.name },
    { key: "seller", header: "Seller", cell: (d) => d.store.seller.name },
    { key: "type", header: "Type", sort: "type", cell: (d) => (d.type === "CUSTOM" ? "Custom domain" : "Subdomain") },
    { key: "status", header: "Verification", sort: "status", cell: (d) => <StatusBadge status={d.status} /> },
    { key: "ssl", header: "SSL", sort: "sslStatus", cell: (d) => <StatusBadge status={d.sslStatus} label={d.sslStatus === "NONE" ? "No SSL" : undefined} /> },
    { key: "createdAt", header: "Created", sort: "createdAt", cell: (d) => formatDate(d.createdAt) },
    { key: "actions", header: "", mobile: "actions", sticky: true, className: "w-10 text-right", cell: (d) => <RowActions actions={domainActions(d, manage)} /> },
  ];
  return (
    <>
      <PageHeader title="Domains" description="STORELAUNCH subdomains and seller custom domains. DNS provider automation is out of scope for now." />
      <FilterBar searchPlaceholder="Search domain, store or seller…" filters={[
        { name: "status", label: "Verification", options: Object.values(DomainStatus).map((v) => ({ value: v, label: humanize(v) })) },
        { name: "type", label: "Type", options: Object.values(DomainType).map((v) => ({ value: v, label: v === "CUSTOM" ? "Custom domain" : "Subdomain" })) },
        { name: "ssl", label: "SSL", options: Object.values(SslStatus).map((v) => ({ value: v, label: humanize(v) })) },
      ]} />
      <DataTable columns={columns} rows={rows} rowKey={(d) => d.id} params={params} basePath="/domains" total={total} emptyTitle="No domains found" />
    </>
  );
}
