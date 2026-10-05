import "server-only";
import { Prisma, ThemeStatus } from "@prisma/client";
import { db } from "../db";
import { enumFilter, pageArgs, type ListParams } from "@/lib/list-params";

export const THEME_SORTABLE = ["updatedAt", "createdAt", "name", "status", "version"];

export async function listThemes(p: ListParams) {
  const status = enumFilter(p.filters.status, Object.values(ThemeStatus));
  const where: Prisma.ThemeWhereInput = {
    ...(status && { status }),
    ...(p.filters.category && { category: { key: p.filters.category } }),
    ...(p.filters.featured && { isFeatured: p.filters.featured === "yes" }),
    ...(p.filters.active && { isActive: p.filters.active === "yes" }),
    ...(p.q && { OR: [{ name: { contains: p.q, mode: "insensitive" } }, { description: { contains: p.q, mode: "insensitive" } }] }),
  };
  const [rows, total] = await Promise.all([
    db.theme.findMany({ where, ...pageArgs(p), orderBy: { [p.sort]: p.dir } as Prisma.ThemeOrderByWithRelationInput, include: { category: true, _count: { select: { stores: true } } } }),
    db.theme.count({ where }),
  ]);
  return { rows, total };
}
