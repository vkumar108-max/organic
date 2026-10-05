"use server";

import { z } from "zod";
import { db } from "../db";
import { ActionError, createAction } from "../actions/create-action";
import { SETTINGS_SECTIONS } from "./definitions";

export const saveSettings = createAction({
  permission: "settings.manage",
  schema: z.object({ section: z.string().max(40), values: z.record(z.string(), z.unknown()) }),
  handler: async ({ section, values }, ctx) => {
    const def = SETTINGS_SECTIONS.find((s) => s.id === section);
    if (!def) throw new ActionError("Unknown settings section.");
    const parsed = def.schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const i of parsed.error.issues) fieldErrors[i.path.join(".")] ??= i.message;
      throw new ActionError(Object.values(fieldErrors)[0] ?? "Invalid settings.", fieldErrors);
    }
    const before = await db.platformSetting.findUnique({ where: { key: section } });
    await ctx.tx(async (tx) => {
      await tx.platformSetting.upsert({
        where: { key: section },
        create: { key: section, group: section, value: parsed.data, updatedById: ctx.user.id },
        update: { value: parsed.data, updatedById: ctx.user.id },
      });
      await ctx.audit({
        action: "settings.updated", targetType: "PlatformSetting", targetId: section,
        description: `Updated ${def.title} settings`,
        metadata: { before: (before?.value ?? def.defaults) as object, after: parsed.data },
      }, tx);
    });
    return `${def.title}: changes saved.`;
  },
});
