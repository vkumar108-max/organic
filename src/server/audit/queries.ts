import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "../db";
import { pageArgs, type ListParams } from "@/lib/list-params";

export const AUDIT_SORTABLE = ["createdAt", "action"];
const PERIOD_MS: Record<string, number> = { today: 86400_000, "7d": 7 * 86400_000, "30d": 30 * 86400_000, "90d": 90 * 86400_000, "1y": 365 * 86400_000 };

export async function listAuditLogs(p: ListParams) {
  const ms = PERIOD_MS[p.filters.period ?? ""];
  const where: Prisma.AuditLogWhereInput = {
    ...(p.filters.action && { action: p.filters.action.endsWith(".*") ? { startsWith: p.filters.action.slice(0, -1) } : p.filters.action }),
    ...(p.filters.actor && { actorId: p.filters.actor }),
    ...(p.filters.target && { targetType: p.filters.target }),
    ...(ms && { createdAt: { gte: new Date(Date.now() - ms) } }),
    ...(p.q && { OR: [{ description: { contains: p.q, mode: "insensitive" } }, { actorEmail: { contains: p.q, mode: "insensitive" } }, { targetId: { equals: p.q } }, { ip: { contains: p.q } }] }),
  };
  const [rows, total] = await Promise.all([
    db.auditLog.findMany({ where, ...pageArgs(p), orderBy: { [p.sort]: p.dir } as Prisma.AuditLogOrderByWithRelationInput }),
    db.auditLog.count({ where }),
  ]);
  return { rows, total };
}

export async function auditFilterOptions() {
  const [targets, actors, groups] = await Promise.all([
    db.auditLog.findMany({ distinct: ["targetType"], select: { targetType: true }, where: { targetType: { not: null } } }),
    db.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.auditLog.findMany({ distinct: ["action"], select: { action: true } }),
  ]);
  const prefixes = [...new Set(groups.map((g) => g.action.split(".")[0]!))].sort();
  return { targets: targets.map((t) => t.targetType!).sort(), actors, prefixes };
}
