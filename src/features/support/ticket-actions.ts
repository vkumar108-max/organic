import type { SupportTicket } from "@prisma/client";
import type { ActionDef } from "@/components/data/action-dialog";
import { addTicketMessage, assignTicket, resolveTicket, setTicketPriority, setTicketStatus } from "@/server/support/actions";
import { humanize } from "@/config/statuses";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"];
const opts = (xs: string[]) => xs.map((v) => ({ value: v, label: humanize(v) }));

export function ticketActions(t: Pick<SupportTicket, "id" | "code" | "priority" | "status" | "assignedToId">, canManage: boolean, admins: { id: string; name: string }[]): ActionDef[] {
  const input = { id: t.id };
  const done = t.status === "RESOLVED" || t.status === "CLOSED";
  return [
    { label: "Assign", action: assignTicket, input, hidden: !canManage, form: { title: `Assign ${t.code}`, submitLabel: "Assign", fields: [{ name: "assigneeId", label: "Assignee", type: "select", defaultValue: t.assignedToId ?? "", options: admins.map((a) => ({ value: a.id, label: a.name })), help: "Choose “—” to unassign." }] } },
    { label: "Change priority", action: setTicketPriority, input, hidden: !canManage, form: { title: `Priority for ${t.code}`, submitLabel: "Update", fields: [{ name: "priority", label: "Priority", type: "select", required: true, defaultValue: t.priority, options: opts(PRIORITIES) }] } },
    { label: "Change status", action: setTicketStatus, input, hidden: !canManage, form: { title: `Status for ${t.code}`, submitLabel: "Update", fields: [{ name: "status", label: "Status", type: "select", required: true, defaultValue: t.status, options: opts(STATUSES) }] } },
    { label: "Resolve ticket", action: resolveTicket, input, hidden: !canManage || done, form: { title: `Resolve ${t.code}`, submitLabel: "Resolve", fields: [{ name: "note", label: "Closing message to the seller", type: "textarea", help: "Optional" }] } },
  ];
}

export const addMessageAction = (id: string): ActionDef => ({
  label: "Add note / reply", action: addTicketMessage, input: { id },
  form: { title: "Add to ticket", submitLabel: "Post", fields: [
    { name: "body", label: "Message", type: "textarea", required: true },
    { name: "isInternal", label: "Internal note (not visible to the seller)", type: "checkbox", defaultValue: true },
  ] },
});
