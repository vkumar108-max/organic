import "server-only";
import { Prisma, StoreStatus } from "@prisma/client";
import { db } from "../db";
import { enumFilter, pageArgs, type ListParams } from "@/lib/list-params";

export const STORE_SORTABLE = ["createdAt", "name", "status", "slug", "category"];

export async function listStores(p: ListParams) {
  const status = enumFilter(p.filters.status, Object.values(StoreStatus));
  const where: Prisma.StoreWhereInput = {
    ...(status && { status }),
    ...(p.filters.category && { category: p.filters.category }),
    ...(p.filters.theme && { themeId: p.filters.theme }),
    ...(p.q && { OR: [
      { name: { contains: p.q, mode: "insensitive" } }, { slug: { contains: p.q, mode: "insensitive" } },
      { seller: { name: { contains: p.q, mode: "insensitive" } } }, { seller: { email: { contains: p.q, mode: "insensitive" } } },
    ] }),
  };
  const [rows, total] = await Promise.all([
    db.store.findMany({ where, ...pageArgs(p), orderBy: { [p.sort]: p.dir } as Prisma.StoreOrderByWithRelationInput,
      include: { seller: { select: { id: true, name: true, plan: { select: { name: true } } } }, theme: { select: { name: true } } } }),
    db.store.count({ where }),
  ]);
  return { rows, total };
}

export async function getStoreDetail(id: string) {
  const store = await db.store.findUnique({ where: { id }, include: { seller: { include: { plan: true } }, theme: { include: { category: true } }, domains: true } });
  if (!store) return null;
  const [orders, customers, recent, monthly] = await Promise.all([
    db.order.aggregate({ where: { storeId: id }, _count: true }),
    db.customer.count({ where: { storeId: id } }),
    db.order.findMany({ where: { storeId: id }, orderBy: { placedAt: "desc" }, take: 8, include: { customer: { select: { name: true } } } }),
    db.$queryRaw<{ bucket: Date; sales: number; orders: number }[]>(Prisma.sql`
      SELECT date_trunc('month', "placedAt") AS bucket,
             COALESCE(SUM(amount) FILTER (WHERE "paymentStatus"='PAID'),0)::float AS sales, COUNT(*)::int AS orders
      FROM "Order" WHERE "storeId" = ${id} AND "placedAt" >= now() - interval '6 months' GROUP BY 1 ORDER BY 1`),
  ]);
  const paid = await db.order.aggregate({ where: { storeId: id, paymentStatus: "PAID" }, _sum: { amount: true }, _count: true });
  return { store, orderCount: orders._count, customers, recent, monthly, paid };
}
