import type { PayoutStatus } from "@prisma/client";
import type { ActionDef } from "@/components/data/action-dialog";
import { approvePayout, completePayout, failPayout, processPayout } from "@/server/payouts/actions";

export function payoutActions(p: { id: string; code: string; status: PayoutStatus; approvedAt: Date | null }, canManage: boolean): ActionDef[] {
  const input = { id: p.id };
  return [
    { label: "Approve payout", action: approvePayout, input, hidden: !canManage || p.status !== "PENDING" || Boolean(p.approvedAt),
      confirm: { title: `Approve ${p.code}?`, description: "Confirms the amounts are correct and the seller is eligible. Processing is a separate step.", confirmLabel: "Approve" } },
    { label: "Process payout", action: processPayout, input, hidden: !canManage || p.status !== "PENDING" || !p.approvedAt,
      confirm: { title: `Process ${p.code}?`, description: "Moves the payout to processing; funds will be sent to the seller.", confirmLabel: "Start processing" } },
    { label: "Mark completed", action: completePayout, input, hidden: !canManage || p.status !== "PROCESSING",
      form: { title: `Complete ${p.code}`, description: "Confirm the transfer was sent.", submitLabel: "Mark completed", fields: [{ name: "reference", label: "Bank / transfer reference", help: "Optional" }] } },
    { label: "Mark failed", action: failPayout, input, destructive: true, hidden: !canManage || !(p.status === "PENDING" || p.status === "PROCESSING"),
      form: { title: `Mark ${p.code} as failed?`, submitLabel: "Mark failed", fields: [{ name: "reason", label: "Failure reason", type: "textarea", required: true }] } },
  ];
}
