import "server-only";
import { PayoutStatus, Prisma } from "@prisma/client";
import { db } from "../db";
import { enumFilter, pageArgs, type ListParams } from "@/lib/list-params";

export const PAYOUT_SORTABLE = ["requestedAt", "grossAmount", "commission", "netAmount", "status", "processedAt", "code"];

export async function listPayouts(p: ListParams) {
  const status = enumFilter(p.filters.status, Object.values(PayoutStatus));
  const where: Prisma.PayoutWhereInput = {
    ...(status && { status }),
    ...(p.q && { OR: [{ code: { contains: p.q, mode: "insensitive" } }, { seller: { name: { contains: p.q, mode: "insensitive" } } }, { store: { name: { contains: p.q, mode: "insensitive" } } }] }),
  };
  const [rows, total, sums] = await Promise.all([
    db.payout.findMany({ where, ...pageArgs(p), orderBy: { [p.sort]: p.dir } as Prisma.PayoutOrderByWithRelationInput, include: { seller: { select: { id: true, name: true } }, store: { select: { name: true } } } }),
    db.payout.count({ where }),
    db.payout.groupBy({ by: ["status"], _sum: { netAmount: true, commission: true }, _count: true }),
  ]);
  return { rows, total, sums };
}
