import "server-only";
import { DomainStatus, DomainType, Prisma, SslStatus } from "@prisma/client";
import { db } from "../db";
import { enumFilter, pageArgs, type ListParams } from "@/lib/list-params";

export const DOMAIN_SORTABLE = ["createdAt", "hostname", "status", "type", "sslStatus"];

export async function listDomains(p: ListParams) {
  const status = enumFilter(p.filters.status, Object.values(DomainStatus));
  const type = enumFilter(p.filters.type, Object.values(DomainType));
  const ssl = enumFilter(p.filters.ssl, Object.values(SslStatus));
  const where: Prisma.DomainWhereInput = {
    ...(status && { status }), ...(type && { type }), ...(ssl && { sslStatus: ssl }),
    ...(p.q && { OR: [{ hostname: { contains: p.q, mode: "insensitive" } }, { store: { name: { contains: p.q, mode: "insensitive" } } }, { store: { seller: { name: { contains: p.q, mode: "insensitive" } } } }] }),
  };
  const [rows, total] = await Promise.all([
    db.domain.findMany({ where, ...pageArgs(p), orderBy: { [p.sort]: p.dir } as Prisma.DomainOrderByWithRelationInput, include: { store: { select: { id: true, name: true, seller: { select: { id: true, name: true } } } } } }),
    db.domain.count({ where }),
  ]);
  return { rows, total };
}
