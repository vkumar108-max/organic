import "server-only";
import { db, type DbClient } from "../db";
import { getRequestInfo } from "../auth/request-info";
import type { Prisma } from "@prisma/client";

export type AuditEntry = {
  actor?: { id: string; email: string } | null;
  action: string; // e.g. "seller.approved"
  targetType?: string;
  targetId?: string;
  description: string;
  metadata?: Prisma.InputJsonValue;
};

/** Append an audit record. Pass `client` (a transaction) to make it atomic with the change it records. */
export async function writeAudit(entry: AuditEntry, client: DbClient = db) {
  const { ip, userAgent } = await getRequestInfo();
  await client.auditLog.create({
    data: {
      actorId: entry.actor?.id ?? null,
      actorEmail: entry.actor?.email ?? null,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      description: entry.description,
      metadata: entry.metadata,
      ip,
      userAgent,
    },
  });
}
