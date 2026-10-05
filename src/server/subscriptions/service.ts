import "server-only";
import type { Prisma } from "@prisma/client";
import type { Tx } from "../db";
import { ActionError } from "../actions/create-action";

const LIVE = ["TRIAL", "ACTIVE", "PAST_DUE"] as const;

export const priceFor = (plan: { monthlyPrice: Prisma.Decimal; yearlyPrice: Prisma.Decimal }, cycle: "MONTHLY" | "YEARLY") =>
  cycle === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;

export function nextRenewal(from: Date, cycle: "MONTHLY" | "YEARLY") {
  const d = new Date(from);
  if (cycle === "YEARLY") d.setUTCFullYear(d.getUTCFullYear() + 1); else d.setUTCMonth(d.getUTCMonth() + 1);
  return d;
}

/** Move a seller (and their live subscription) to a plan, creating a subscription when none exists. */
export async function applyPlanToSeller(tx: Tx, sellerId: string, planId: string) {
  const plan = await tx.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new ActionError("Plan not found.");
  if (!plan.isActive) throw new ActionError("That plan is inactive and can't be assigned.");
  const seller = await tx.seller.findUnique({ where: { id: sellerId }, include: { plan: true } });
  if (!seller) throw new ActionError("Seller not found.");

  const live = await tx.subscription.findFirst({ where: { sellerId, status: { in: [...LIVE] } }, orderBy: { createdAt: "desc" } });
  if (live) {
    await tx.subscription.update({ where: { id: live.id }, data: { planId, amount: priceFor(plan, live.billingCycle) } });
  } else {
    const count = await tx.subscription.count();
    const now = new Date();
    await tx.subscription.create({
      data: {
        code: `SUB-${String(10000 + count + 1)}`, sellerId, planId, billingCycle: "MONTHLY", amount: plan.monthlyPrice,
        status: "ACTIVE", startedAt: now, renewsAt: nextRenewal(now, "MONTHLY"),
      },
    });
  }
  await tx.seller.update({ where: { id: sellerId }, data: { planId } });
  return { from: seller.plan?.name ?? "None", to: plan.name };
}
