import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requirePermission } from "@/server/rbac/context";
import { getStoreDetail } from "@/server/stores/queries";
import { storeUrl } from "@/server/stores/url";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { DetailList } from "@/components/data/detail-list";
import { ActionButton } from "@/components/data/action-dialog";
import { TimeSeriesChart } from "@/components/charts/charts";
import { EmptyState } from "@/components/ui/states";
import { buttonClass } from "@/components/ui/button";
import { EntityLink, MiniTable, Mono, Stat, Td } from "@/features/shared/ui";
import { storeActions } from "@/features/stores/store-actions";
import { formatDate, formatDateTime, formatMoney, formatNumber } from "@/lib/format";

export const metadata = { title: "Store" };

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("stores.view");
  const { id } = await params;
  const d = await getStoreDetail(id);
  if (!d) notFound();
  const { store, recent, monthly, paid } = d;
  const actions = storeActions(store, ctx.can("stores.manage")).filter((a) => !a.hidden);
  const aov = paid._count ? Number(paid._sum.amount ?? 0) / paid._count : 0;

  return (
    <>
      <Link href="/stores" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" />All stores</Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-xl font-semibold text-slate-900">{store.name}</h1><StatusBadge status={store.status} /></div>
          <p className="mt-1 text-sm text-slate-500">{store.category} · created {formatDate(store.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={storeUrl(store.slug)} target="_blank" rel="noopener noreferrer" className={buttonClass("secondary")}><ExternalLink className="h-4 w-4" />Open store preview</a>
          {actions.map((a) => <ActionButton key={a.label} def={a} variant={a.label === "Activate store" ? "primary" : undefined} />)}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Orders" value={formatNumber(d.orderCount)} />
        <Stat label="Sales (paid)" value={formatMoney(paid._sum.amount)} />
        <Stat label="Customers" value={formatNumber(d.customers)} />
        <Stat label="Avg. order value" value={formatMoney(aov)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Store details" />
          <CardBody><DetailList items={[
            { label: "URL / slug", value: <Mono>{store.slug}</Mono> },
            { label: "Owner", value: ctx.can("sellers.view") ? <EntityLink href={`/sellers/${store.seller.id}`}>{store.seller.name}</EntityLink> : store.seller.name },
            { label: "Plan", value: store.seller.plan?.name }, { label: "Category", value: store.category },
            { label: "Selected theme", value: store.theme ? `${store.theme.name} (${store.theme.category.name} · v${store.theme.version})` : "No theme selected" },
            { label: "Description", value: store.description },
          ]} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Domains" />
          {store.domains.length === 0 ? <EmptyState title="No domains" /> : (
            <ul className="divide-y divide-slate-100">
              {store.domains.map((dm) => (
                <li key={dm.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-900">{dm.hostname}</p><p className="text-xs text-slate-500">{dm.type === "CUSTOM" ? "Custom domain" : "STORELAUNCH subdomain"} · SSL {dm.sslStatus.toLowerCase()}</p></div>
                  <StatusBadge status={dm.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
        {ctx.can("orders.view") && (
          <>
            <Card className="lg:col-span-3"><CardHeader title="Sales, last 6 months" /><CardBody>
              {monthly.length === 0 ? <EmptyState title="No orders in this period" /> : <TimeSeriesChart kind="bar" format="money" height={220} data={monthly.map((m) => ({ label: new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(m.bucket)), sales: m.sales }))} series={[{ key: "sales", label: "Sales" }]} />}
            </CardBody></Card>
            <Card className="lg:col-span-3"><CardHeader title="Recent orders" />
              {recent.length === 0 ? <EmptyState title="No orders yet" /> : (
                <MiniTable head={["Order", "Customer", "Amount", "Payment", "Status", "Date"]}>
                  {recent.map((o) => <tr key={o.id}><Td><EntityLink href={`/orders/${o.id}`}>{o.number}</EntityLink></Td><Td>{o.customer.name}</Td><Td>{formatMoney(o.amount)}</Td><Td><StatusBadge status={o.paymentStatus} /></Td><Td><StatusBadge status={o.status} /></Td><Td>{formatDateTime(o.placedAt)}</Td></tr>)}
                </MiniTable>
              )}
            </Card>
          </>
        )}
      </div>
    </>
  );
}
