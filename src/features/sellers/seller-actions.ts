import type { SellerStatus } from "@prisma/client";
import type { ActionDef } from "@/components/data/action-dialog";
import { approveSeller, blockSeller, changeSellerPlan, reactivateSeller, rejectSeller, suspendSeller } from "@/server/sellers/actions";
import { canTransition } from "@/server/sellers/transitions";

const reasonField = { name: "reason", label: "Reason", type: "textarea" as const, required: true, help: "Recorded in the audit log." };

/** Action definitions shared by the list row menu and the detail header. Hidden when not permitted / not valid for the status. */
export function sellerActions(s: { id: string; name: string; status: SellerStatus; planId: string | null }, opts: { canManage: boolean; canChangePlan: boolean; plans: { id: string; name: string }[] }): ActionDef[] {
  const m = opts.canManage;
  const input = { id: s.id };
  return [
    { label: "Approve seller", action: approveSeller, input, hidden: !m || !canTransition("approve", s.status),
      confirm: { title: `Approve ${s.name}?`, description: "The seller will be able to publish stores and start selling.", confirmLabel: "Approve" } },
    { label: "Reject seller", action: rejectSeller, input, destructive: true, hidden: !m || !canTransition("reject", s.status),
      form: { title: `Reject ${s.name}?`, description: "The seller application will be marked as rejected.", fields: [reasonField], submitLabel: "Reject seller" } },
    { label: "Suspend seller", action: suspendSeller, input, destructive: true, hidden: !m || !canTransition("suspend", s.status),
      form: { title: `Suspend ${s.name}?`, description: "Their active stores will be suspended too. This is reversible.", fields: [reasonField], submitLabel: "Suspend" } },
    { label: "Block seller", action: blockSeller, input, destructive: true, hidden: !m || !canTransition("block", s.status),
      form: { title: `Block ${s.name}?`, description: "Blocking is a serious action: all active stores go offline and the seller cannot sign in. Only a reactivation restores access.", fields: [reasonField], submitLabel: "Block seller" } },
    { label: "Reactivate seller", action: reactivateSeller, input, hidden: !m || !canTransition("reactivate", s.status),
      confirm: { title: `Reactivate ${s.name}?`, description: "Account access is restored. Suspended stores stay suspended until you reactivate them individually.", confirmLabel: "Reactivate" } },
    { label: "Change plan", action: changeSellerPlan, input, hidden: !opts.canChangePlan || s.status === "BLOCKED" || s.status === "REJECTED",
      form: { title: `Change plan for ${s.name}`, fields: [{ name: "planId", label: "New plan", type: "select", required: true, defaultValue: s.planId ?? "", options: opts.plans.map((p) => ({ value: p.id, label: p.name })) }], submitLabel: "Change plan" } },
  ];
}
