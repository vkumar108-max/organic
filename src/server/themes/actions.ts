"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { ActionError, createAction, idSchema } from "../actions/create-action";

const imageUrl = z.string().trim().max(500).refine((v) => v === "" || /^https:\/\//.test(v) || /^\/[\w\-./]+$/.test(v), "Use an https:// URL or a path like /theme-previews/x.svg").optional();

const fields = {
  name: z.string().trim().min(2, "Name is required").max(60),
  categoryId: z.string().min(1, "Choose a category"),
  description: z.string().trim().max(500).optional(),
  version: z.string().trim().regex(/^\d+\.\d+\.\d+$/, "Use semantic version, e.g. 1.2.0"),
  previewImageUrl: imageUrl,
  isFeatured: z.boolean(),
};

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const createTheme = createAction({
  permission: "themes.manage",
  schema: z.object(fields),
  handler: async (input, ctx) => {
    try {
      const t = await ctx.tx(async (tx) => {
        if (!(await tx.themeCategory.findUnique({ where: { id: input.categoryId } }))) throw new ActionError("Category not found.");
        const theme = await tx.theme.create({ data: { ...input, description: input.description || null, previewImageUrl: input.previewImageUrl || null, slug: slugify(input.name), status: "DRAFT" } });
        await ctx.audit({ action: "theme.created", targetType: "Theme", targetId: theme.id, description: `Created theme ${theme.name} v${theme.version}` }, tx);
        return theme;
      });
      return `Theme “${t.name}” created as a draft.`;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") throw new ActionError("A theme with that name already exists.", { name: "Name already in use" });
      throw e;
    }
  },
});

export const updateTheme = createAction({
  permission: "themes.manage",
  schema: idSchema.extend(fields),
  handler: async ({ id, ...input }, ctx) => {
    await ctx.tx(async (tx) => {
      const before = await tx.theme.findUnique({ where: { id } });
      if (!before) throw new ActionError("Theme not found.");
      await tx.theme.update({ where: { id }, data: { ...input, description: input.description || null, previewImageUrl: input.previewImageUrl || null } });
      await ctx.audit({ action: "theme.updated", targetType: "Theme", targetId: id, description: `Updated theme ${input.name} (v${before.version} → v${input.version})` }, tx);
    });
    return "Theme updated.";
  },
});

export const publishTheme = createAction({
  permission: "themes.manage",
  schema: idSchema,
  handler: async ({ id }, ctx) => {
    await ctx.tx(async (tx) => {
      const t = await tx.theme.findUnique({ where: { id } });
      if (!t) throw new ActionError("Theme not found.");
      if (t.status === "PUBLISHED") throw new ActionError("Theme is already published.");
      if (!t.previewImageUrl || !t.description) throw new ActionError("Add a preview image and description before publishing.");
      await tx.theme.update({ where: { id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
      await ctx.audit({ action: "theme.published", targetType: "Theme", targetId: id, description: `Published theme ${t.name} v${t.version}` }, tx);
    });
    return "Theme published.";
  },
});

export const unpublishTheme = createAction({
  permission: "themes.manage",
  schema: idSchema,
  handler: async ({ id }, ctx) => {
    await ctx.tx(async (tx) => {
      const t = await tx.theme.findUnique({ where: { id } });
      if (!t) throw new ActionError("Theme not found.");
      if (t.status !== "PUBLISHED") throw new ActionError("Only published themes can be unpublished.");
      await tx.theme.update({ where: { id }, data: { status: "UNPUBLISHED" } });
      await ctx.audit({ action: "theme.unpublished", targetType: "Theme", targetId: id, description: `Unpublished theme ${t.name}` }, tx);
    });
    return "Theme unpublished. Stores already using it are unaffected.";
  },
});

export const setThemeActive = createAction({
  permission: "themes.manage",
  schema: idSchema.extend({ active: z.boolean() }),
  handler: async ({ id, active }, ctx) => {
    await ctx.tx(async (tx) => {
      const t = await tx.theme.findUnique({ where: { id } });
      if (!t) throw new ActionError("Theme not found.");
      await tx.theme.update({ where: { id }, data: { isActive: active, ...(active ? {} : { isFeatured: false }) } });
      await ctx.audit({ action: active ? "theme.activated" : "theme.deactivated", targetType: "Theme", targetId: id, description: `${active ? "Activated" : "Deactivated"} theme ${t.name}` }, tx);
    });
    return active ? "Theme activated." : "Theme deactivated.";
  },
});

export const setThemeFeatured = createAction({
  permission: "themes.manage",
  schema: idSchema.extend({ featured: z.boolean() }),
  handler: async ({ id, featured }, ctx) => {
    await ctx.tx(async (tx) => {
      const t = await tx.theme.findUnique({ where: { id } });
      if (!t) throw new ActionError("Theme not found.");
      if (featured && (t.status !== "PUBLISHED" || !t.isActive)) throw new ActionError("Only published, active themes can be featured.");
      await tx.theme.update({ where: { id }, data: { isFeatured: featured } });
      await ctx.audit({ action: "theme.featured", targetType: "Theme", targetId: id, description: `${featured ? "Featured" : "Unfeatured"} theme ${t.name}` }, tx);
    });
    return featured ? "Theme featured." : "Theme removed from featured.";
  },
});
