import { Check } from "lucide-react";
import { requirePermission } from "@/server/rbac/context";
import { db } from "@/server/db";
import { Card, PageHeader } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { ActionButton } from "@/components/data/action-dialog";
import { EmptyState } from "@/components/ui/states";
import { createPlanAction, editPlanAction, togglePlanAction } from "@/features/plans/plan-actions";
import { featureLabel } from "@/config/plan-features";
import { formatLimit, formatMoney, formatNumber, formatStorage } from "@/lib/format";

export const metadata = { title: "Plans & Pricing" };

export default async function PlansPage() {
  const ctx = await requirePermission("plans.view");
  const [plans, counts] = await Promise.all([
    db.plan.findMany({ orderBy: { sortOrder: "asc" } }),
    db.subscription.groupBy({ by: ["planId"], where: { status: { in: ["ACTIVE", "TRIAL", "PAST_DUE"] } }, _count: true }),
  ]);
  const subs = new Map(counts.map((c) => [c.planId, c._count]));
  const manage = ctx.can("plans.manage");
  return (
    <>
      <PageHeader title="Plans & pricing" description="Configure what sellers pay and what each plan unlocks." actions={manage && <ActionButton variant="primary" def={createPlanAction()} />} />
      {plans.length === 0 ? <Card><EmptyState title="No plans yet" description="Create your first plan." /></Card> : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => (
            <Card key={p.id} className={`flex flex-col ${p.isPopular ? "ring-2 ring-brand-500" : ""} ${p.isActive ? "" : "opacity-75"}`}>
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">{p.name}</h3>
                  <div className="flex gap-1.5">{p.isPopular && <Badge tone="purple">Popular</Badge>}<StatusBadge status={p.isActive} /></div>
                </div>
                <p className="mt-1 min-h-10 text-sm text-slate-500">{p.description}</p>
                <p className="mt-4"><span className="text-3xl font-bold tabular-nums text-slate-900">{formatMoney(p.monthlyPrice)}</span><span className="text-sm text-slate-500"> /month</span></p>
                <p className="text-xs text-slate-500">{Number(p.yearlyPrice) > 0 ? `${formatMoney(p.yearlyPrice)} billed yearly` : "No yearly price"}{p.trialDays > 0 && ` · ${p.trialDays}-day trial`}</p>
                <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
                  {[["Products", formatLimit(p.productLimit)], ["Orders / month", formatLimit(p.orderLimit)], ["Storage", formatStorage(p.storageLimitMb)]].map(([k, v]) => (
                    <div key={k} className="flex justify-between"><dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-800">{v}</dd></div>
                  ))}
                </dl>
                <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                  {(p.features as string[]).map((f) => <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{featureLabel(f)}</li>)}
                  {(p.features as string[]).length === 0 && <li className="text-slate-400">Core features only</li>}
                </ul>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                <span className="whitespace-nowrap text-xs text-slate-500">{formatNumber(subs.get(p.id) ?? 0)} subs</span>
                {manage && <div className="flex gap-2"><ActionButton size="sm" def={editPlanAction(p)} /><ActionButton size="sm" variant="ghost" def={togglePlanAction(p)} /></div>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
