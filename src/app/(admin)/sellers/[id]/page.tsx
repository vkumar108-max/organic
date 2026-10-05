import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/server/rbac/context";
import { getSellerDetail } from "@/server/sellers/queries";
import { db } from "@/server/db";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { DetailList } from "@/components/data/detail-list";
import { ActionButton, RowActions } from "@/components/data/action-dialog";
import { TimeSeriesChart } from "@/components/charts/charts";
import { EmptyState } from "@/components/ui/states";
import { ActivityList, EntityLink, MiniTable, Mono, Stat, Td } from "@/features/shared/ui";
import { sellerActions } from "@/features/sellers/seller-actions";
import { formatDate, formatDateTime, formatMoney, formatNumber, timeAgo } from "@/lib/format";
import { humanize } from "@/config/statuses";

export const metadata = { title: "Seller" };

export default async function SellerDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const ctx = await requirePermission("sellers.view");
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const [detail, plans] = await Promise.all([getSellerDetail(id), db.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } })]);
  if (!detail) notFound();
  const { seller, revenue, byStore, monthly, orders, activity, payouts } = detail;

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "stores", label: "Stores", count: seller.stores.length },
    ...(ctx.can("subscriptions.view") ? [{ key: "subscription", label: "Subscription" }] : []),
    ...(ctx.can("orders.view") ? [{ key: "orders", label: "Orders" }, { key: "revenue", label: "Revenue" }] : []),
    { key: "activity", label: "Activity" },
  ];
  const tab = tabs.some((t) => t.key === tabParam) ? tabParam! : "overview";
  const base = `/sellers/${seller.id}`;
  const actions = sellerActions(seller, { canManage: ctx.can("sellers.manage"), canChangePlan: ctx.can("sellers.manage") && ctx.can("subscriptions.manage"), plans });
  const live = seller.subscriptions.find((s) => ["TRIAL", "ACTIVE", "PAST_DUE"].includes(s.status));
  const storeName = new Map(seller.stores.map((s) => [s.id, s.name]));

  return (
    <>
      <Link href="/sellers" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" />All sellers</Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-xl font-semibold text-slate-900">{seller.name}</h1><StatusBadge status={seller.status} /></div>
          <p className="mt-1 text-sm text-slate-500"><Mono>{seller.code}</Mono> · {seller.businessName ?? "No business name"} · Registered {formatDate(seller.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2 md:hidden"><RowActions actions={actions} /></div>
        <div className="hidden flex-wrap gap-2 md:flex">{actions.filter((a) => !a.hidden).map((a) => <ActionButton key={a.label} def={a} variant={a.label === "Approve seller" ? "primary" : undefined} />)}</div>
      </div>

      <Tabs items={tabs} active={tab} basePath={base} />

      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Seller profile" />
            <CardBody><DetailList items={[
              { label: "Name", value: seller.name }, { label: "Business", value: seller.businessName },
              { label: "Email", value: <a className="text-brand-700 hover:underline" href={`mailto:${seller.email}`}>{seller.email}</a> }, { label: "Phone", value: seller.phone },
              { label: "Location", value: [seller.city, seller.country].filter(Boolean).join(", ") || null }, { label: "Address", value: seller.address },
            ]} /></CardBody>
          </Card>
          <Card>
            <CardHeader title="Account status" />
            <CardBody className="space-y-4">
              <DetailList columns={1} items={[
                { label: "Status", value: <StatusBadge status={seller.status} /> },
                { label: "Reason", value: seller.statusReason },
                { label: "Approved", value: formatDate(seller.approvedAt) },
                { label: "Last activity", value: timeAgo(seller.lastActivityAt) },
                { label: "Open tickets", value: formatNumber(detail.openTickets) },
              ]} />
            </CardBody>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader title="At a glance" />
            <CardBody className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat label="Current plan" value={seller.plan?.name ?? "—"} hint={live ? `${humanize(live.billingCycle)} · ${humanize(live.status)}` : "No subscription"} />
              <Stat label="Stores" value={seller.stores.length} />
              {ctx.can("orders.view") && <><Stat label="Paid orders" value={formatNumber(revenue._count)} /><Stat label="Seller revenue" value={formatMoney(revenue._sum.amount)} hint="Gross sales through all stores" /></>}
            </CardBody>
          </Card>
        </div>
      )}

      {tab === "stores" && (
        <Card><CardHeader title="Stores" />
          {seller.stores.length === 0 ? <EmptyState title="No stores yet" /> : (
            <MiniTable head={["Store", "Slug", "Category", "Theme", "Status", "Orders", "Created"]}>
              {seller.stores.map((s) => (
                <tr key={s.id}><Td>{ctx.can("stores.view") ? <EntityLink href={`/stores/${s.id}`}>{s.name}</EntityLink> : s.name}</Td><Td><Mono>{s.slug}</Mono></Td><Td>{s.category}</Td><Td>{s.theme?.name ?? "—"}</Td><Td><StatusBadge status={s.status} /></Td><Td>{s._count.orders}</Td><Td>{formatDate(s.createdAt)}</Td></tr>
              ))}
            </MiniTable>
          )}
        </Card>
      )}

      {tab === "subscription" && (
        <div className="space-y-6">
          <Card><CardHeader title="Subscriptions" />
            {seller.subscriptions.length === 0 ? <EmptyState title="No subscription" /> : (
              <MiniTable head={["ID", "Plan", "Cycle", "Amount", "Status", "Started", "Renews"]}>
                {seller.subscriptions.map((s) => (
                  <tr key={s.id}><Td><EntityLink href={`/subscriptions/${s.id}`}>{s.code}</EntityLink></Td><Td>{s.plan.name}</Td><Td>{humanize(s.billingCycle)}</Td><Td>{formatMoney(s.amount)}</Td><Td><StatusBadge status={s.status} /></Td><Td>{formatDate(s.startedAt)}</Td><Td>{formatDate(s.renewsAt)}</Td></tr>
                ))}
              </MiniTable>
            )}
          </Card>
        </div>
      )}

      {tab === "orders" && (
        <Card><CardHeader title="Recent orders" description="Latest 20 across this seller's stores" />
          {orders.length === 0 ? <EmptyState title="No orders yet" /> : (
            <MiniTable head={["Order", "Store", "Customer", "Amount", "Payment", "Status", "Date"]}>
              {orders.map((o) => (
                <tr key={o.id}><Td><EntityLink href={`/orders/${o.id}`}>{o.number}</EntityLink></Td><Td>{o.store.name}</Td><Td>{o.customer.name}</Td><Td>{formatMoney(o.amount)}</Td><Td><StatusBadge status={o.paymentStatus} /></Td><Td><StatusBadge status={o.status} /></Td><Td>{formatDateTime(o.placedAt)}</Td></tr>
              ))}
            </MiniTable>
          )}
        </Card>
      )}

      {tab === "revenue" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Gross sales" value={formatMoney(revenue._sum.amount)} hint={`${formatNumber(revenue._count)} paid orders`} />
            <Stat label="Commission paid" value={formatMoney(payouts._sum.commission)} hint="On completed payouts" />
            <Stat label="Net paid out" value={formatMoney(payouts._sum.netAmount)} />
          </div>
          <Card><CardHeader title="Sales, last 12 months" /><CardBody>
            {monthly.length === 0 ? <EmptyState title="No sales yet" /> : <TimeSeriesChart kind="bar" format="money" data={monthly.map((m) => ({ label: new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(m.bucket)), sales: m.value }))} series={[{ key: "sales", label: "Sales" }]} />}
          </CardBody></Card>
          <Card><CardHeader title="By store" />
            {byStore.length === 0 ? <EmptyState title="No paid orders" /> : (
              <MiniTable head={["Store", "Paid orders", "Sales"]}>
                {byStore.map((b) => <tr key={b.storeId}><Td>{storeName.get(b.storeId)}</Td><Td>{b._count}</Td><Td>{formatMoney(b._sum.amount)}</Td></tr>)}
              </MiniTable>
            )}
          </Card>
        </div>
      )}

      {tab === "activity" && <Card><CardHeader title="Account activity" description="Administrative actions taken on this seller" /><ActivityList items={activity} emptyTitle="No admin activity recorded for this seller" /></Card>}
    </>
  );
}
