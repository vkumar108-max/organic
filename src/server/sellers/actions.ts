"use server";

import { z } from "zod";
import { ActionError, createAction, idSchema, reasonSchema } from "../actions/create-action";
import { SELLER_TRANSITIONS, canTransition, type SellerAction } from "./transitions";
import { applyPlanToSeller } from "../subscriptions/service";

const AUDIT_NAMES: Record<SellerAction, [string, string]> = {
  approve: ["seller.approved", "Approved"],
  reject: ["seller.rejected", "Rejected"],
  suspend: ["seller.suspended", "Suspended"],
  block: ["seller.blocked", "Blocked"],
  reactivate: ["seller.reactivated", "Reactivated"],
};

function statusAction(kind: SellerAction, requireReason: boolean) {
  return createAction({
    permission: "sellers.manage",
    schema: idSchema.extend({ reason: requireReason ? z.string().trim().min(3, "Please provide a reason").max(500) : reasonSchema }),
    handler: async ({ id, reason }, ctx) => {
      const [auditAction, verb] = AUDIT_NAMES[kind];
      const t = SELLER_TRANSITIONS[kind];
      await ctx.tx(async (tx) => {
        const seller = await tx.seller.findUnique({ where: { id } });
        if (!seller) throw new ActionError("Seller not found.");
        if (!canTransition(kind, seller.status)) throw new ActionError(`A ${seller.status.toLowerCase()} seller can't be ${verb.toLowerCase()}.`);
        await tx.seller.update({
          where: { id },
          data: { status: t.to, statusReason: reason ?? null, ...(kind === "approve" ? { approvedAt: new Date() } : {}) },
        });
        // Taking a seller offline must also take their live stores offline.
        let stores = 0;
        if (kind === "suspend" || kind === "block") {
          stores = (await tx.store.updateMany({ where: { sellerId: id, status: "ACTIVE" }, data: { status: "SUSPENDED" } })).count;
        }
        await ctx.audit({
          action: auditAction, targetType: "Seller", targetId: id,
          description: `${verb} seller ${seller.name} (${seller.code})${reason ? ` — ${reason}` : ""}`,
          metadata: { from: seller.status, to: t.to, reason: reason ?? null, storesSuspended: stores },
        }, tx);
      });
      return `Seller ${verb.toLowerCase()}.`;
    },
  });
}

export const approveSeller = statusAction("approve", false);
export const rejectSeller = statusAction("reject", true);
export const suspendSeller = statusAction("suspend", true);
export const blockSeller = statusAction("block", true);
export const reactivateSeller = statusAction("reactivate", false);

export const changeSellerPlan = createAction({
  permission: ["sellers.manage", "subscriptions.manage"],
  schema: idSchema.extend({ planId: z.string().min(1, "Choose a plan") }),
  handler: async ({ id, planId }, ctx) => {
    await ctx.tx(async (tx) => {
      const seller = await tx.seller.findUnique({ where: { id } });
      if (!seller) throw new ActionError("Seller not found.");
      if (seller.status === "BLOCKED" || seller.status === "REJECTED") throw new ActionError("Plan can't be changed for a blocked or rejected seller.");
      const r = await applyPlanToSeller(tx, id, planId);
      await ctx.audit({ action: "plan.seller_changed", targetType: "Seller", targetId: id, description: `Changed ${seller.name}'s plan from ${r.from} to ${r.to}`, metadata: r }, tx);
    });
    return "Plan updated.";
  },
});

