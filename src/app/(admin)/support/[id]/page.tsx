import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { requirePermission } from "@/server/rbac/context";
import { getTicketDetail, listAssignableAdmins } from "@/server/support/queries";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { DetailList } from "@/components/data/detail-list";
import { ActionButton } from "@/components/data/action-dialog";
import { EntityLink } from "@/features/shared/ui";
import { addMessageAction, ticketActions } from "@/features/support/ticket-actions";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Ticket" };

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await requirePermission("support.view");
  const { id } = await params;
  const [t, admins] = await Promise.all([getTicketDetail(id), listAssignableAdmins()]);
  if (!t) notFound();
  const manage = ctx.can("support.manage");
  const actions = ticketActions(t, manage, admins).filter((a) => !a.hidden);
  return (
    <>
      <Link href="/support" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="h-4 w-4" />All tickets</Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3"><h1 className="text-xl font-semibold text-slate-900">{t.subject}</h1><StatusBadge status={t.status} /><StatusBadge status={t.priority} /></div>
          <p className="mt-1 text-sm text-slate-500">{t.code} · opened {formatDateTime(t.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">{actions.map((a) => <ActionButton key={a.label} def={a} variant={a.label === "Resolve ticket" ? "primary" : undefined} />)}</div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Conversation" action={manage && t.status !== "CLOSED" ? <ActionButton size="sm" variant="primary" def={addMessageAction(t.id)} /> : undefined} />
          <ol className="space-y-4 p-5">
            {t.messages.length === 0 && <li className="text-sm text-slate-500">No messages yet.</li>}
            {t.messages.map((m) => (
              <li key={m.id} className={cn("rounded-lg border p-4", m.isInternal ? "border-amber-200 bg-amber-50" : m.authorType === "SELLER" ? "border-slate-200 bg-white" : "border-brand-100 bg-brand-50")}>
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{m.authorName} <span className="font-normal">· {m.authorType === "SELLER" ? "Seller" : "Admin"}</span></span>
                  <span className="flex items-center gap-2">{m.isInternal && <span className="inline-flex items-center gap-1 font-medium text-amber-700"><Lock className="h-3 w-3" />Internal note</span>}{formatDateTime(m.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-slate-800">{m.body}</p>
              </li>
            ))}
          </ol>
        </Card>
        <Card><CardHeader title="Details" /><CardBody><DetailList columns={1} items={[
          { label: "Seller", value: ctx.can("sellers.view") ? <EntityLink href={`/sellers/${t.seller.id}`}>{t.seller.name}</EntityLink> : t.seller.name },
          { label: "Store", value: t.store?.name ?? "—" }, { label: "Category", value: t.category },
          { label: "Assigned to", value: t.assignedTo?.name ?? "Unassigned" }, { label: "Updated", value: formatDateTime(t.updatedAt) }, { label: "Resolved", value: formatDateTime(t.resolvedAt) },
        ]} /></CardBody></Card>
      </div>
    </>
  );
}
