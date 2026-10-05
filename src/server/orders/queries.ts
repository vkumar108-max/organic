import "server-only";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { db } from "../db";
import { enumFilter, pageArgs, type ListParams } from "@/lib/list-params";

export const ORDER_SORTABLE = ["placedAt", "amount", "number", "status", "paymentStatus"];

export async function listOrders(p: ListParams) {
  const status = enumFilter(p.filters.status, Object.values(OrderStatus));
  const pay = enumFilter(p.filters.payment, Object.values(PaymentStatus));
  const where: Prisma.OrderWhereInput = {
    ...(status && { status }), ...(pay && { paymentStatus: pay }),
    ...(p.filters.store && { storeId: p.filters.store }),
    ...(p.filters.seller && { store: { sellerId: p.filters.seller } }),
    ...(p.q && { OR: [
      { number: { contains: p.q, mode: "insensitive" } },
      { customer: { name: { contains: p.q, mode: "insensitive" } } }, { customer: { email: { contains: p.q, mode: "insensitive" } } },
      { payments: { some: { transactionRef: { contains: p.q, mode: "insensitive" } } } },
    ] }),
  };
  const [rows, total] = await Promise.all([
    db.order.findMany({ where, ...pageArgs(p), orderBy: { [p.sort]: p.dir } as Prisma.OrderOrderByWithRelationInput,
      include: { store: { select: { id: true, name: true, seller: { select: { id: true, name: true } } } }, customer: { select: { id: true, name: true } } } }),
    db.order.count({ where }),
  ]);
  return { rows, total };
}

export const getOrderDetail = (id: string) =>
  db.order.findUnique({ where: { id }, include: { items: true, payments: { orderBy: { createdAt: "desc" } }, customer: true, store: { include: { seller: true } } } });
