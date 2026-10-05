"use server";

import { z } from "zod";
import { ActionError, createAction, idSchema } from "../actions/create-action";
import type { Tx } from "../db";

const RL = { limit: 60, windowMs: 60_000 };

async function loadPayout(tx: Tx, id: string) {
  const p = await tx.payout.findUnique({ where: { id }, include: { seller: { select: { name: true, status: true } } } });
  if (!p) throw new ActionError("Payout not found.");
  return p;
}

export const approvePayout = createAction({
  permission: "payouts.manage", schema: idSchema, rateLimit: RL,
  handler: async ({ id }, ctx) => {
    await ctx.tx(async (tx) => {
      const p = await loadPayout(tx, id);
      if (p.status !== "PENDING") throw new ActionError("Only pending payouts can be approved.");
      if (p.approvedAt) throw new ActionError("This payout is already approved.");
      if (p.seller.status === "BLOCKED" || p.seller.status === "SUSPENDED") throw new ActionError(`Seller is ${p.seller.status.toLowerCase()}; resolve the account status before approving.`);
      await tx.payout.update({ where: { id }, data: { approvedAt: new Date(), approvedById: ctx.user.id } });
      await ctx.audit({ action: "payout.approved", targetType: "Payout", targetId: id, description: `Approved payout ${p.code} (${p.netAmount} net) for ${p.seller.name}`, metadata: { net: p.netAmount.toString() } }, tx);
    });
    return "Payout approved.";
  },
});

export const processPayout = createAction({
  permission: "payouts.manage", schema: idSchema, rateLimit: RL,
  handler: async ({ id }, ctx) => {
    await ctx.tx(async (tx) => {
      const p = await loadPayout(tx, id);
      if (p.status !== "PENDING") throw new ActionError("Only pending payouts can be processed.");
      if (!p.approvedAt) throw new ActionError("Approve the payout before processing it.");
      await tx.payout.update({ where: { id }, data: { status: "PROCESSING", processedAt: new Date() } });
      await ctx.audit({ action: "payout.processing", targetType: "Payout", targetId: id, description: `Started processing payout ${p.code} for ${p.seller.name}` }, tx);
    });
    return "Payout moved to processing.";
  },
});

export const completePayout = createAction({
  permission: "payouts.manage", schema: idSchema.extend({ reference: z.string().trim().max(80).optional() }), rateLimit: RL,
  handler: async ({ id, reference }, ctx) => {
    await ctx.tx(async (tx) => {
      const p = await loadPayout(tx, id);
      if (p.status !== "PROCESSING") throw new ActionError("Only payouts in processing can be completed.");
      await tx.payout.update({ where: { id }, data: { status: "COMPLETED", completedAt: new Date(), reference: reference || p.reference } });
      await ctx.audit({ action: "payout.completed", targetType: "Payout", targetId: id, description: `Marked payout ${p.code} completed (${p.netAmount} to ${p.seller.name})`, metadata: { reference: reference ?? null } }, tx);
    });
    return "Payout marked as completed.";
  },
});

export const failPayout = createAction({
  permission: "payouts.manage", schema: idSchema.extend({ reason: z.string().trim().min(3, "Please provide a reason").max(300) }), rateLimit: RL,
  handler: async ({ id, reason }, ctx) => {
    await ctx.tx(async (tx) => {
      const p = await loadPayout(tx, id);
      if (p.status !== "PENDING" && p.status !== "PROCESSING") throw new ActionError("Only pending or processing payouts can be marked failed.");
      await tx.payout.update({ where: { id }, data: { status: "FAILED", failureReason: reason } });
      await ctx.audit({ action: "payout.failed", targetType: "Payout", targetId: id, description: `Marked payout ${p.code} failed — ${reason}`, metadata: { reason } }, tx);
    });
    return "Payout marked as failed.";
  },
});
