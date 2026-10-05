"use server";

import { z } from "zod";
import { ActionError, createAction, idSchema } from "../actions/create-action";
import { nextRenewal, priceFor } from "./service";

const LIVE = ["TRIAL", "ACTIVE", "PAST_DUE"];

export const changeSubscriptionPlan = createAction({
  permission: "subscriptions.manage",
  schema: idSchema.extend({ planId: z.string().min(1, "Choose a plan"), billingCycle: z.enum(["MONTHLY", "YEARLY"]) }),
  handler: async ({ id, planId, billingCycle }, ctx) => {
    await ctx.tx(async (tx) => {
      const sub = await tx.subscription.findUnique({ where: { id }, include: { plan: true, seller: true } });
      if (!sub) throw new ActionError("Subscription not found.");
      if (!LIVE.includes(sub.status)) throw new ActionError("Only live subscriptions can change plan. Reactivate it first.");
      const plan = await tx.plan.findUnique({ where: { id: planId } });
      if (!plan?.isActive) throw new ActionError("Choose an active plan.");
      await tx.subscription.update({ where: { id }, data: { planId, billingCycle, amount: priceFor(plan, billingCycle) } });
      await tx.seller.update({ where: { id: sub.sellerId }, data: { planId } });
      await ctx.audit({ action: "subscription.plan_changed", targetType: "Subscription", targetId: id,
        description: `${sub.code}: ${sub.plan.name} → ${plan.name} (${billingCycle.toLowerCase()})`, metadata: { from: sub.plan.name, to: plan.name, billingCycle } }, tx);
    });
    return "Subscription updated.";
  },
});

export const cancelSubscription = createAction({
  permission: "subscriptions.manage",
  schema: idSchema.extend({ reason: z.string().trim().min(3, "Please provide a reason").max(500) }),
  handler: async ({ id, reason }, ctx) => {
    await ctx.tx(async (tx) => {
      const sub = await tx.subscription.findUnique({ where: { id } });
      if (!sub) throw new ActionError("Subscription not found.");
      if (!LIVE.includes(sub.status)) throw new ActionError("This subscription is already ended.");
      await tx.subscription.update({ where: { id }, data: { status: "CANCELLED", cancelledAt: new Date(), cancelReason: reason, renewsAt: null } });
      await ctx.audit({ action: "subscription.cancelled", targetType: "Subscription", targetId: id, description: `Cancelled ${sub.code} — ${reason}`, metadata: { reason } }, tx);
    });
    return "Subscription cancelled.";
  },
});

export const reactivateSubscription = createAction({
  permission: "subscriptions.manage",
  schema: idSchema,
  handler: async ({ id }, ctx) => {
    await ctx.tx(async (tx) => {
      const sub = await tx.subscription.findUnique({ where: { id }, include: { plan: true, seller: true } });
      if (!sub) throw new ActionError("Subscription not found.");
      if (sub.status !== "CANCELLED" && sub.status !== "EXPIRED") throw new ActionError("Only cancelled or expired subscriptions can be reactivated.");
      if (sub.seller.status !== "ACTIVE") throw new ActionError("The seller account isn't active.");
      if (!sub.plan.isActive) throw new ActionError("The plan is inactive. Change the plan instead.");
      const now = new Date();
      await tx.subscription.update({ where: { id }, data: { status: "ACTIVE", cancelledAt: null, cancelReason: null, renewsAt: nextRenewal(now, sub.billingCycle) } });
      await tx.seller.update({ where: { id: sub.sellerId }, data: { planId: sub.planId } });
      await ctx.audit({ action: "subscription.reactivated", targetType: "Subscription", targetId: id, description: `Reactivated ${sub.code}` }, tx);
    });
    return "Subscription reactivated.";
  },
});
