import "server-only";
import { Prisma, SellerStatus } from "@prisma/client";
import { db } from "../db";
import { enumFilter, pageArgs, type ListParams } from "@/lib/list-params";

export const SELLER_SORTABLE = ["createdAt", "name", "status", "lastActivityAt", "code"];

export async function listSellers(p: ListParams) {
  const status = enumFilter(p.filters.status, Object.values(SellerStatus));
  const where: Prisma.SellerWhereInput = {
    ...(status && { status }),
    ...(p.filters.plan && { plan: { key: p.filters.plan } }),
    ...(p.q && {
      OR: [
        { name: { contains: p.q, mode: "insensitive" } },
        { email: { contains: p.q, mode: "insensitive" } },
        { code: { contains: p.q, mode: "insensitive" } },
        { businessName: { contains: p.q, mode: "insensitive" } },
        { stores: { some: { name: { contains: p.q, mode: "insensitive" } } } },
      ],
    }),
  };
  const [rows, total] = await Promise.all([
    db.seller.findMany({
      where, ...pageArgs(p),
      orderBy: { [p.sort]: p.dir } as Prisma.SellerOrderByWithRelationInput,
      include: { plan: { select: { name: true, key: true } }, stores: { select: { name: true }, take: 2, orderBy: { createdAt: "asc" } }, _count: { select: { stores: true } } },
    }),
    db.seller.count({ where }),
  ]);
  return { rows, total };
}

export async function getSellerDetail(id: string) {
  const seller = await db.seller.findUnique({
    where: { id },
    include: {
      plan: true,
      stores: { include: { theme: { select: { name: true } }, domains: { select: { hostname: true, status: true } }, _count: { select: { orders: true } } }, orderBy: { createdAt: "asc" } },
      subscriptions: { include: { plan: { select: { name: true } }, invoices: { orderBy: { periodStart: "desc" }, take: 12 } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!seller) return null;
  const storeIds = seller.stores.map((s) => s.id);
  const [revenue, byStore, monthly, orders, activity, tickets, payouts] = await Promise.all([
    db.order.aggregate({ where: { storeId: { in: storeIds }, paymentStatus: "PAID" }, _sum: { amount: true }, _count: true }),
    db.order.groupBy({ by: ["storeId"], where: { storeId: { in: storeIds }, paymentStatus: "PAID" }, _sum: { amount: true }, _count: true }),
    db.$queryRaw<{ bucket: Date; value: number }[]>(Prisma.sql`
      SELECT date_trunc('month', "placedAt") AS bucket, COALESCE(SUM(amount),0)::float AS value
      FROM "Order" WHERE "paymentStatus" = 'PAID' AND "storeId" IN (${storeIds.length ? Prisma.join(storeIds) : Prisma.sql`''`})
      AND "placedAt" >= now() - interval '12 months' GROUP BY 1 ORDER BY 1`),
    db.order.findMany({ where: { storeId: { in: storeIds } }, orderBy: { placedAt: "desc" }, take: 20, include: { store: { select: { name: true } }, customer: { select: { name: true } } } }),
    db.auditLog.findMany({ where: { targetType: "Seller", targetId: id }, orderBy: { createdAt: "desc" }, take: 30 }),
    db.supportTicket.count({ where: { sellerId: id, status: { in: ["OPEN", "IN_PROGRESS", "WAITING"] } } }),
    db.payout.aggregate({ where: { sellerId: id, status: "COMPLETED" }, _sum: { commission: true, netAmount: true } }),
  ]);
  return { seller, revenue, byStore, monthly, orders, activity, openTickets: tickets, payouts };
}
