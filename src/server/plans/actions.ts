"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { ActionError, createAction, idSchema } from "../actions/create-action";

const limit = z.number().int("Whole numbers only").min(0).max(1_000_000_000).nullable();
const money = z.number().min(0).max(1_000_000);

const planFields = {
  name: z.string().trim().min(2, "Name is required").max(40),
  description: z.string().trim().max(300).optional(),
  monthlyPrice: money,
  yearlyPrice: money,
  trialDays: z.number().int().min(0).max(90),
  productLimit: limit,
  orderLimit: limit,
  storageLimitMb: limit,
  features: z.array(z.string().max(60)).max(60),
  customFeatures: z.string().max(400).optional(),
  isActive: z.boolean(),
  isPopular: z.boolean(),
};

const slug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function featureList(features: string[], custom?: string) {
  const extra = (custom ?? "").split(",").map((s) => slug(s).replace(/-/g, "_")).filter(Boolean);
  return [...new Set([...features, ...extra])];
}

export const createPlan = createAction({
  permission: "plans.manage",
  schema: z.object(planFields),
  handler: async (input, ctx) => {
    const key = slug(input.name);
    if (!key) throw new ActionError("Name must contain letters or numbers.", { name: "Invalid name" });
    const last = await ctx.tx((tx) => tx.plan.aggregate({ _max: { sortOrder: true } }));
    try {
      const plan = await ctx.tx(async (tx) => {
        const p = await tx.plan.create({
          data: {
            key, name: input.name, description: input.description || null,
            monthlyPrice: input.monthlyPrice, yearlyPrice: input.yearlyPrice, trialDays: input.trialDays,
            productLimit: input.productLimit, orderLimit: input.orderLimit, storageLimitMb: input.storageLimitMb,
            features: featureList(input.features, input.customFeatures), isActive: input.isActive, isPopular: input.isPopular,
            sortOrder: (last._max.sortOrder ?? 0) + 1,
          },
        });
        await ctx.audit({ action: "plan.created", targetType: "Plan", targetId: p.id, description: `Created plan ${p.name}`, metadata: { monthly: input.monthlyPrice, yearly: input.yearlyPrice } }, tx);
        return p;
      });
      return `Plan “${plan.name}” created.`;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") throw new ActionError("A plan with that name already exists.", { name: "Name already in use" });
      throw e;
    }
  },
});

export const updatePlan = createAction({
  permission: "plans.manage",
  schema: idSchema.extend(planFields),
  handler: async ({ id, customFeatures, features, ...input }, ctx) => {
    await ctx.tx(async (tx) => {
      const before = await tx.plan.findUnique({ where: { id } });
      if (!before) throw new ActionError("Plan not found.");
      const after = await tx.plan.update({
        where: { id },
        data: { ...input, description: input.description || null, features: featureList(features, customFeatures) },
      });
      const changed = (["monthlyPrice", "yearlyPrice", "trialDays", "productLimit", "orderLimit", "storageLimitMb", "isActive", "name"] as const)
        .filter((k) => String(before[k]) !== String(after[k])).map((k) => `${k}: ${before[k]} → ${after[k]}`);
      await ctx.audit({ action: "plan.updated", targetType: "Plan", targetId: id, description: `Updated plan ${after.name}${changed.length ? ` (${changed.join("; ")})` : ""}`, metadata: { changed } }, tx);
    });
    return "Plan updated.";
  },
});

export const setPlanActive = createAction({
  permission: "plans.manage",
  schema: idSchema.extend({ active: z.boolean() }),
  handler: async ({ id, active }, ctx) => {
    await ctx.tx(async (tx) => {
      const plan = await tx.plan.findUnique({ where: { id } });
      if (!plan) throw new ActionError("Plan not found.");
      if (!active) {
        const remaining = await tx.plan.count({ where: { isActive: true, id: { not: id } } });
        if (remaining === 0) throw new ActionError("At least one plan must stay active.");
      }
      await tx.plan.update({ where: { id }, data: { isActive: active } });
      await ctx.audit({ action: active ? "plan.activated" : "plan.deactivated", targetType: "Plan", targetId: id, description: `${active ? "Activated" : "Deactivated"} plan ${plan.name}` }, tx);
    });
    return active ? "Plan activated." : "Plan deactivated. Existing subscribers keep it; new sign-ups can't select it.";
  },
});
