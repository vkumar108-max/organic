import { SubscriptionStatus } from "@prisma/client";
import { requirePermission } from "@/server/rbac/context";
import { parseListParams, type RawSearchParams } from "@/lib/list-params";
import { listSubscriptions, SUBSCRIPTION_SORTABLE } from "@/server/subscriptions/queries";
import { db } from "@/server/db";
import { PageHeader } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/data/data-table";
import { FilterBar } from "@/components/data/filter-bar";
import { RowActions } from "@/components/data/action-dialog";
import { StatusBadge } from "@/components/ui/badge";
import { humanize } from "@/config/statuses";
import { formatDate, formatMoney } from "@/lib/format";
import { EntityLink } from "@/features/shared/ui";
import { subscriptionActions } from "@/features/subscriptions/subscription-actions";

export const metadata = { title: "Subscriptions" };

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const ctx = await requirePermission("subscriptions.view");
  const params = parseListParams(await searchParams, { sortable: SUBSCRIPTION_SORTABLE, defaultSort: "createdAt", filters: ["status", "plan", "cycle"] });
  const [{ rows, total }, plans] = await Promise.all([listSubscriptions(params), db.plan.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, key: true, name: true, isActive: true } })]);
  const active = plans.filter((p) => p.isActive);
  const manage = ctx.can("subscriptions.manage");
  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    { key: "code", header: "Subscription", sort: "code", mobile: "title", cell: (s) => <EntityLink href={`/subscriptions/${s.id}`}>{s.code}</EntityLink> },
    { key: "seller", header: "Seller", cell: (s) => ctx.can("sellers.view") ? <EntityLink href={`/sellers/${s.seller.id}`}>{s.seller.name}</EntityLink> : s.seller.name },
    { key: "store", header: "Store", cell: (s) => s.store?.name ?? "—" },
    { key: "plan", header: "Plan", cell: (s) => s.plan.name },
    { key: "cycle", header: "Billing", cell: (s) => humanize(s.billingCycle) },
    { key: "amount", header: "Amount", sort: "amount", cell: (s) => formatMoney(s.amount) },
    { key: "status", header: "Status", sort: "status", cell: (s) => <StatusBadge status={s.status} /> },
    { key: "startedAt", header: "Start", sort: "startedAt", cell: (s) => formatDate(s.startedAt) },
    { key: "renewsAt", header: "Renewal", sort: "renewsAt", cell: (s) => formatDate(s.renewsAt) },
    { key: "actions", header: "", mobile: "actions", sticky: true, className: "w-10 text-right", cell: (s) => <RowActions actions={subscriptionActions(s, manage, active)} extra={[{ label: "View subscription", href: `/subscriptions/${s.id}` }]} /> },
  ];
  return (
    <>
      <PageHeader title="Subscriptions" description="Seller billing plans and renewal status." />
      <FilterBar searchPlaceholder="Search ID, seller or store…" filters={[
        { name: "status", label: "Status", options: Object.values(SubscriptionStatus).map((v) => ({ value: v, label: humanize(v) })) },
        { name: "plan", label: "Plan", options: plans.map((p) => ({ value: p.key, label: p.name })) },
        { name: "cycle", label: "Billing", options: [{ value: "MONTHLY", label: "Monthly" }, { value: "YEARLY", label: "Yearly" }] },
      ]} />
      <DataTable columns={columns} rows={rows} rowKey={(s) => s.id} params={params} basePath="/subscriptions" total={total} emptyTitle="No subscriptions found" />
    </>
  );
}
