import "server-only";
import { Prisma, TicketPriority, TicketStatus } from "@prisma/client";
import { db } from "../db";
import { enumFilter, pageArgs, type ListParams } from "@/lib/list-params";

export const TICKET_SORTABLE = ["updatedAt", "createdAt", "priority", "status", "code", "subject"];

export async function listTickets(p: ListParams, meId: string) {
  const status = enumFilter(p.filters.status, Object.values(TicketStatus));
  const priority = enumFilter(p.filters.priority, Object.values(TicketPriority));
  const a = p.filters.assignee;
  const where: Prisma.SupportTicketWhereInput = {
    ...(status && { status }), ...(priority && { priority }),
    ...(p.filters.category && { category: p.filters.category }),
    ...(a === "me" ? { assignedToId: meId } : a === "none" ? { assignedToId: null } : {}),
    ...(p.q && { OR: [{ code: { contains: p.q, mode: "insensitive" } }, { subject: { contains: p.q, mode: "insensitive" } }, { seller: { name: { contains: p.q, mode: "insensitive" } } }] }),
  };
  // Postgres sorts enums by declaration order, so priority/status sort by severity.
  const orderBy: Prisma.SupportTicketOrderByWithRelationInput[] = [{ [p.sort]: p.dir } as Prisma.SupportTicketOrderByWithRelationInput];
  const [rows, total] = await Promise.all([
    db.supportTicket.findMany({ where, ...pageArgs(p), orderBy, include: { seller: { select: { id: true, name: true } }, store: { select: { name: true } }, assignedTo: { select: { id: true, name: true } } } }),
    db.supportTicket.count({ where }),
  ]);
  return { rows, total };
}

export async function getTicketDetail(id: string) {
  return db.supportTicket.findUnique({ where: { id }, include: { seller: true, store: true, assignedTo: true, messages: { orderBy: { createdAt: "asc" } } } });
}

/** Admins who can take tickets: Super Admins and anyone with support.manage. */
export function listAssignableAdmins() {
  return db.user.findMany({
    where: { status: "ACTIVE", roles: { some: { role: { OR: [{ key: "super_admin" }, { permissions: { some: { permission: { key: "support.manage" } } } }] } } } },
    select: { id: true, name: true }, orderBy: { name: "asc" },
  });
}
