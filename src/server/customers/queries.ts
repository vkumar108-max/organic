import "server-only";
import { CustomerStatus, Prisma } from "@prisma/client";
import { db } from "../db";
import { enumFilter, pageArgs, type ListParams } from "@/lib/list-params";

export const CUSTOMER_SORTABLE = ["createdAt", "name", "email", "status"];

export async function listCustomers(p: ListParams) {
  const status = enumFilter(p.filters.status, Object.values(CustomerStatus));
  const where: Prisma.CustomerWhereInput = {
    ...(status && { status }), ...(p.filters.store && { storeId: p.filters.store }),
    ...(p.q && { OR: [{ name: { contains: p.q, mode: "insensitive" } }, { email: { contains: p.q, mode: "insensitive" } }, { phone: { contains: p.q } }] }),
  };
  const [rows, total] = await Promise.all([
    db.customer.findMany({ where, ...pageArgs(p), orderBy: { [p.sort]: p.dir } as Prisma.CustomerOrderByWithRelationInput, include: { store: { select: { id: true, name: true } } } }),
    db.customer.count({ where }),
  ]);
  // Totals for just this page's customers (paid orders count toward spending).
  const agg = await db.order.groupBy({ by: ["customerId"], where: { customerId: { in: rows.map((r) => r.id) } }, _count: true, _sum: { amount: true } });
  const paid = await db.order.groupBy({ by: ["customerId"], where: { customerId: { in: rows.map((r) => r.id) }, paymentStatus: "PAID" }, _sum: { amount: true } });
  const orders = new Map(agg.map((a) => [a.customerId, a._count]));
  const spend = new Map(paid.map((a) => [a.customerId, Number(a._sum.amount ?? 0)]));
  return { rows: rows.map((r) => ({ ...r, totalOrders: orders.get(r.id) ?? 0, totalSpend: spend.get(r.id) ?? 0 })), total };
}

export async function getCustomerDetail(id: string) {
  const c = await db.customer.findUnique({ where: { id }, include: { store: { include: { seller: { select: { id: true, name: true } } } } } });
  if (!c) return null;
  const [orders, paid] = await Promise.all([
    db.order.findMany({ where: { customerId: id }, orderBy: { placedAt: "desc" }, take: 50 }),
    db.order.aggregate({ where: { customerId: id, paymentStatus: "PAID" }, _sum: { amount: true }, _count: true }),
  ]);
  return { customer: c, orders, paid };
}
