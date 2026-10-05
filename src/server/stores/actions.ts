"use server";

import { z } from "zod";
import { ActionError, createAction, idSchema, reasonSchema } from "../actions/create-action";
import { STORE_TRANSITIONS, canStoreTransition, type StoreAction } from "./transitions";

const NAMES: Record<StoreAction, [string, string]> = {
  activate: ["store.activated", "activated"],
  suspend: ["store.suspended", "suspended"],
  disable: ["store.disabled", "disabled"],
};

function storeAction(kind: StoreAction, requireReason: boolean) {
  return createAction({
    permission: "stores.manage",
    schema: idSchema.extend({ reason: requireReason ? z.string().trim().min(3, "Please provide a reason").max(500) : reasonSchema }),
    handler: async ({ id, reason }, ctx) => {
      const [auditAction, verb] = NAMES[kind];
      await ctx.tx(async (tx) => {
        const store = await tx.store.findUnique({ where: { id }, include: { seller: { select: { status: true, name: true } } } });
        if (!store) throw new ActionError("Store not found.");
        if (!canStoreTransition(kind, store.status)) throw new ActionError(`A ${store.status.toLowerCase()} store can't be ${verb}.`);
        if (kind === "activate" && store.seller.status !== "ACTIVE") throw new ActionError(`The owner (${store.seller.name}) is ${store.seller.status.toLowerCase()}; stores can only go live for active sellers.`);
        await tx.store.update({ where: { id }, data: { status: STORE_TRANSITIONS[kind].to } });
        await ctx.audit({
          action: auditAction, targetType: "Store", targetId: id,
          description: `Store ${store.name} ${verb}${reason ? ` — ${reason}` : ""}`,
          metadata: { from: store.status, to: STORE_TRANSITIONS[kind].to, reason: reason ?? null },
        }, tx);
      });
      return `Store ${verb}.`;
    },
  });
}

export const activateStore = storeAction("activate", false);
export const suspendStore = storeAction("suspend", true);
export const disableStore = storeAction("disable", true);
