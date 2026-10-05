import "server-only";
import { Prisma, SubscriptionStatus, BillingCycle } from "@prisma/client";
import { db } from "../db";
import { enumFilter, pageArgs, type ListParams } from "@/lib/list-params";

export const SUBSCRIPTION_SORTABLE = ["createdAt", "startedAt", "renewsAt", "amount", "status", "code"];

export async function listSubscriptions(p: ListParams) {
  const status = enumFilter(p.filters.status, Object.values(SubscriptionStatus));
  const cycle = enumFilter(p.filters.cycle, Object.values(BillingCycle));
  const where: Prisma.SubscriptionWhereInput = {
    ...(status && { status }), ...(cycle && { billingCycle: cycle }),
    ...(p.filters.plan && { plan: { key: p.filters.plan } }),
    ...(p.q && { OR: [
      { code: { contains: p.q, mode: "insensitive" } },
      { seller: { name: { contains: p.q, mode: "insensitive" } } }, { seller: { email: { contains: p.q, mode: "insensitive" } } },
      { store: { name: { contains: p.q, mode: "insensitive" } } },
    ] }),
  };
  const [rows, total] = await Promise.all([
    db.subscription.findMany({ where, ...pageArgs(p), orderBy: { [p.sort]: p.dir } as Prisma.SubscriptionOrderByWithRelationInput,
      include: { seller: { select: { id: true, name: true } }, store: { select: { id: true, name: true } }, plan: { select: { id: true, name: true } } } }),
    db.subscription.count({ where }),
  ]);
  return { rows, total };
}

export const getSubscriptionDetail = (id: string) =>
  db.subscription.findUnique({ where: { id }, include: { seller: true, store: true, plan: true, invoices: { orderBy: { periodStart: "desc" } } } });
