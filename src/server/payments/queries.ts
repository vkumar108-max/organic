import "server-only";
import { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { db } from "../db";
import { enumFilter, pageArgs, type ListParams } from "@/lib/list-params";

export const PAYMENT_SORTABLE = ["createdAt", "amount", "status", "code", "method"];

export async function listPayments(p: ListParams) {
  const status = enumFilter(p.filters.status, Object.values(PaymentStatus));
  const method = enumFilter(p.filters.method, Object.values(PaymentMethod));
  const where: Prisma.PaymentWhereInput = {
    ...(status && { status }), ...(method && { method }),
    ...(p.filters.store && { order: { storeId: p.filters.store } }),
    ...(p.q && { OR: [
      { code: { contains: p.q, mode: "insensitive" } }, { transactionRef: { contains: p.q, mode: "insensitive" } },
      { order: { number: { contains: p.q, mode: "insensitive" } } }, { order: { customer: { name: { contains: p.q, mode: "insensitive" } } } },
    ] }),
  };
  const [rows, total, totals] = await Promise.all([
    db.payment.findMany({ where, ...pageArgs(p), orderBy: { [p.sort]: p.dir } as Prisma.PaymentOrderByWithRelationInput,
      include: { order: { select: { id: true, number: true, customer: { select: { name: true, email: true } }, store: { select: { id: true, name: true, seller: { select: { name: true } } } } } } } }),
    db.payment.count({ where }),
    db.payment.groupBy({ by: ["status"], where, _sum: { amount: true } }),
  ]);
  return { rows, total, totals: Object.fromEntries(totals.map((t) => [t.status, Number(t._sum.amount ?? 0)])) as Partial<Record<PaymentStatus, number>> };
}
