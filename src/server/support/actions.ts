"use server";

import { z } from "zod";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { ActionError, createAction, idSchema } from "../actions/create-action";

export const assignTicket = createAction({
  permission: "support.manage",
  schema: idSchema.extend({ assigneeId: z.string().max(40).optional() }),
  handler: async ({ id, assigneeId }, ctx) => {
    await ctx.tx(async (tx) => {
      const t = await tx.supportTicket.findUnique({ where: { id }, include: { assignedTo: true } });
      if (!t) throw new ActionError("Ticket not found.");
      let name = "nobody";
      if (assigneeId) {
        const u = await tx.user.findUnique({ where: { id: assigneeId }, include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } });
        const ok = u?.status === "ACTIVE" && u.roles.some((r) => r.role.key === "super_admin" || r.role.permissions.some((p) => p.permission.key === "support.manage"));
        if (!u || !ok) throw new ActionError("That user can't be assigned support tickets.");
        name = u.name;
      }
      await tx.supportTicket.update({ where: { id }, data: { assignedToId: assigneeId || null, ...(assigneeId && t.status === "OPEN" ? { status: "IN_PROGRESS" } : {}) } });
      await ctx.audit({ action: "ticket.assigned", targetType: "SupportTicket", targetId: id, description: `${t.code} assigned to ${name}`, metadata: { from: t.assignedTo?.email ?? null, to: assigneeId ?? null } }, tx);
    });
    return assigneeId ? "Ticket assigned." : "Ticket unassigned.";
  },
});

export const setTicketPriority = createAction({
  permission: "support.manage",
  schema: idSchema.extend({ priority: z.nativeEnum(TicketPriority) }),
  handler: async ({ id, priority }, ctx) => {
    await ctx.tx(async (tx) => {
      const t = await tx.supportTicket.findUnique({ where: { id } });
      if (!t) throw new ActionError("Ticket not found.");
      await tx.supportTicket.update({ where: { id }, data: { priority } });
      await ctx.audit({ action: "ticket.priority_changed", targetType: "SupportTicket", targetId: id, description: `${t.code} priority ${t.priority} → ${priority}` }, tx);
    });
    return "Priority updated.";
  },
});

export const setTicketStatus = createAction({
  permission: "support.manage",
  schema: idSchema.extend({ status: z.nativeEnum(TicketStatus) }),
  handler: async ({ id, status }, ctx) => {
    await ctx.tx(async (tx) => {
      const t = await tx.supportTicket.findUnique({ where: { id } });
      if (!t) throw new ActionError("Ticket not found.");
      if (t.status === status) throw new ActionError("Ticket already has that status.");
      const done = status === "RESOLVED" || status === "CLOSED";
      await tx.supportTicket.update({ where: { id }, data: { status, resolvedAt: done ? t.resolvedAt ?? new Date() : null } });
      await ctx.audit({ action: status === "RESOLVED" ? "ticket.resolved" : "ticket.status_changed", targetType: "SupportTicket", targetId: id, description: `${t.code} status ${t.status} → ${status}` }, tx);
    });
    return "Status updated.";
  },
});

export const resolveTicket = createAction({
  permission: "support.manage",
  schema: idSchema.extend({ note: z.string().trim().max(2000).optional() }),
  handler: async ({ id, note }, ctx) => {
    await ctx.tx(async (tx) => {
      const t = await tx.supportTicket.findUnique({ where: { id } });
      if (!t) throw new ActionError("Ticket not found.");
      if (t.status === "RESOLVED" || t.status === "CLOSED") throw new ActionError("Ticket is already resolved.");
      await tx.supportTicket.update({ where: { id }, data: { status: "RESOLVED", resolvedAt: new Date() } });
      if (note) await tx.supportMessage.create({ data: { ticketId: id, authorType: "ADMIN", authorId: ctx.user.id, authorName: ctx.user.name, body: note, isInternal: false } });
      await ctx.audit({ action: "ticket.resolved", targetType: "SupportTicket", targetId: id, description: `${t.code} resolved` }, tx);
    });
    return "Ticket resolved.";
  },
});

export const addTicketMessage = createAction({
  permission: "support.manage",
  schema: idSchema.extend({ body: z.string().trim().min(1, "Write a message").max(4000), isInternal: z.boolean() }),
  handler: async ({ id, body, isInternal }, ctx) => {
    await ctx.tx(async (tx) => {
      const t = await tx.supportTicket.findUnique({ where: { id } });
      if (!t) throw new ActionError("Ticket not found.");
      if (t.status === "CLOSED") throw new ActionError("Closed tickets can't receive messages. Reopen it first.");
      await tx.supportMessage.create({ data: { ticketId: id, authorType: "ADMIN", authorId: ctx.user.id, authorName: ctx.user.name, body, isInternal } });
      await tx.supportTicket.update({ where: { id }, data: { updatedAt: new Date(), ...(!isInternal && t.status === "OPEN" ? { status: "IN_PROGRESS" } : {}) } });
      await ctx.audit({ action: isInternal ? "ticket.note_added" : "ticket.replied", targetType: "SupportTicket", targetId: id, description: `${isInternal ? "Internal note added to" : "Replied on"} ${t.code}` }, tx);
    });
    return "Message added.";
  },
});
