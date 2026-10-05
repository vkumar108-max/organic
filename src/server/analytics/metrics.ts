import "server-only";
import { db } from "../db";
import { getSection } from "../settings/service";

const num = (v: { toString(): string } | null | undefined) => Number(v?.toString() ?? 0);

/** Platform KPI values straight from the database. Each group is fetched only if the caller may see it. */
export async function getKpis(can: { sellers: boolean; stores: boolean; customers: boolean; orders: boolean; revenue: boolean; subscriptions: boolean; payouts: boolean }) {
  const since30 = new Date(Date.now() - 30 * 86400_000);
  const [sellers, stores, customers, orders, revenue, subs, payouts] = await Promise.all([
    can.sellers ? Promise.all([db.seller.count(), db.seller.count({ where: { status: "ACTIVE" } }), db.seller.count({ where: { createdAt: { gte: since30 } } }), db.seller.count({ where: { status: "PENDING" } })]) : null,
    can.stores ? Promise.all([db.store.count(), db.store.count({ where: { status: "ACTIVE" } }), db.store.count({ where: { createdAt: { gte: since30 } } })]) : null,
    can.customers ? db.customer.count() : null,
    can.orders ? Promise.all([db.order.count(), db.order.count({ where: { placedAt: { gte: since30 } } })]) : null,
    can.revenue
      ? Promise.all([
          db.subscriptionInvoice.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
          db.payout.aggregate({ where: { status: "COMPLETED" }, _sum: { commission: true } }),
          db.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
        ])
      : null,
    can.subscriptions ? Promise.all([db.subscription.groupBy({ by: ["billingCycle"], where: { status: "ACTIVE" }, _sum: { amount: true }, _count: true }), db.subscription.count({ where: { status: "TRIAL" } })]) : null,
    can.payouts ? db.payout.aggregate({ where: { status: "PENDING" }, _sum: { netAmount: true }, _count: true }) : null,
  ]);

  const mrr = subs ? subs[0].reduce((s, g) => s + (g.billingCycle === "YEARLY" ? num(g._sum.amount) / 12 : num(g._sum.amount)), 0) : null;
  return {
    sellers: sellers && { total: sellers[0], active: sellers[1], new30: sellers[2], pending: sellers[3] },
    stores: stores && { total: stores[0], active: stores[1], new30: stores[2] },
    customers,
    orders: orders && { total: orders[0], last30: orders[1] },
    revenue: revenue && { subscriptions: num(revenue[0]._sum.amount), commission: num(revenue[1]._sum.commission), total: num(revenue[0]._sum.amount) + num(revenue[1]._sum.commission), gmv: num(revenue[2]._sum.amount) },
    mrr,
    subscriptions: subs && { active: subs[0].reduce((s, g) => s + g._count, 0), trial: subs[1] },
    payouts: payouts && { amount: num(payouts._sum.netAmount), count: payouts._count },
  };
}

export async function getPlanDistribution() {
  const [groups, plans] = await Promise.all([
    db.subscription.groupBy({ by: ["planId"], where: { status: { in: ["ACTIVE", "TRIAL", "PAST_DUE"] } }, _count: true }),
    db.plan.findMany({ select: { id: true, name: true } }),
  ]);
  const names = new Map(plans.map((p) => [p.id, p.name]));
  return groups.map((g) => ({ name: names.get(g.planId) ?? "Unknown", value: g._count })).sort((a, b) => b.value - a.value);
}

export async function getOrdersByStatus() {
  const g = await db.order.groupBy({ by: ["status"], _count: true });
  return g.map((x) => ({ name: x.status.charAt(0) + x.status.slice(1).toLowerCase(), value: x._count })).sort((a, b) => b.value - a.value);
}

export async function getTopStores(limit = 5) {
  const g = await db.order.groupBy({ by: ["storeId"], where: { paymentStatus: "PAID" }, _sum: { amount: true }, _count: true, orderBy: { _sum: { amount: "desc" } }, take: limit });
  const stores = await db.store.findMany({ where: { id: { in: g.map((x) => x.storeId) } }, select: { id: true, name: true, slug: true, seller: { select: { name: true } } } });
  const byId = new Map(stores.map((s) => [s.id, s]));
  return g.map((x) => ({ store: byId.get(x.storeId)!, revenue: num(x._sum.amount), orders: x._count })).filter((x) => x.store);
}

export async function getCommissionRate() {
  return Number((await getSection("commission")).defaultRatePercent);
}
