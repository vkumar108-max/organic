import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/server/rbac/context";
import { getSubscriptionDetail } from "@/server/subscriptions/queries";
import { db } from "@/server/db";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { DetailList } from "@/components/data/detail-list";
import { ActionButton } from "@/components/data/action-dialog";
import { EmptyState } from "@/components/ui/states";
import { EntityLink, MiniTable, Mono, Td } from "@/features/shared/ui";
import { subscriptionActions } from "@/features/subscriptions/subscription-actions";
import { formatDate, formatMoney } from "@/lib/format";
import { humanize } from "@/config/statuses";

export const metadata = { title: "Subscription" };

export default async function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("subscriptions.view");
  const { id } = await params;
  const [sub, plans] = await Promise.all([getSubscriptionDetail(id), db.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } })]);
  if (!sub) notFound();
  const actions = subscriptionActions(sub, ctx.can("subscriptions.manage"), plans).filter((a) => !a.hidden);
  return (
    <>
      <Link href="/subscriptions" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" />All subscriptions</Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3"><h1 className="text-xl font-semibold text-slate-900">{sub.code}</h1><StatusBadge status={sub.status} /></div>
        <div className="flex flex-wrap gap-2">{actions.map((a) => <ActionButton key={a.label} def={a} />)}</div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-3"><CardHeader title="Subscription details" /><CardBody>
          <DetailList columns={3} items={[
            { label: "Seller", value: ctx.can("sellers.view") ? <EntityLink href={`/sellers/${sub.seller.id}`}>{sub.seller.name}</EntityLink> : sub.seller.name },
            { label: "Store", value: sub.store ? (ctx.can("stores.view") ? <EntityLink href={`/stores/${sub.store.id}`}>{sub.store.name}</EntityLink> : sub.store.name) : "—" },
            { label: "Plan", value: sub.plan.name }, { label: "Billing cycle", value: humanize(sub.billingCycle) },
            { label: "Amount", value: `${formatMoney(sub.amount)} / ${sub.billingCycle === "YEARLY" ? "year" : "month"}` },
            { label: "Started", value: formatDate(sub.startedAt) }, { label: "Trial ends", value: formatDate(sub.trialEndsAt) },
            { label: "Renews", value: formatDate(sub.renewsAt) }, { label: "Cancelled", value: sub.cancelledAt ? `${formatDate(sub.cancelledAt)}${sub.cancelReason ? ` — ${sub.cancelReason}` : ""}` : "—" },
          ]} />
        </CardBody></Card>
        <Card className="lg:col-span-3"><CardHeader title="Billing history" />
          {sub.invoices.length === 0 ? <EmptyState title="No invoices yet" description={sub.status === "TRIAL" ? "The first invoice is created when the trial ends." : undefined} /> : (
            <MiniTable head={["Invoice", "Period", "Amount", "Status", "Paid on"]}>
              {sub.invoices.map((i) => <tr key={i.id}><Td><Mono>{i.number}</Mono></Td><Td>{formatDate(i.periodStart)} – {formatDate(i.periodEnd)}</Td><Td>{formatMoney(i.amount)}</Td><Td><StatusBadge status={i.status} /></Td><Td>{formatDate(i.paidAt)}</Td></tr>)}
            </MiniTable>
          )}
        </Card>
      </div>
    </>
  );
}
