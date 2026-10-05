import type { SubscriptionStatus } from "@prisma/client";
import type { ActionDef } from "@/components/data/action-dialog";
import { cancelSubscription, changeSubscriptionPlan, reactivateSubscription } from "@/server/subscriptions/actions";

type Sub = { id: string; code: string; status: SubscriptionStatus; planId: string; billingCycle: "MONTHLY" | "YEARLY" };

export function subscriptionActions(s: Sub, canManage: boolean, plans: { id: string; name: string }[]): ActionDef[] {
  const live = ["TRIAL", "ACTIVE", "PAST_DUE"].includes(s.status);
  const input = { id: s.id };
  return [
    { label: "Change plan", action: changeSubscriptionPlan, input, hidden: !canManage || !live,
      form: { title: `Change plan for ${s.code}`, description: "The amount is recalculated from the plan's current price.", submitLabel: "Change plan", fields: [
        { name: "planId", label: "Plan", type: "select", required: true, defaultValue: s.planId, options: plans.map((p) => ({ value: p.id, label: p.name })) },
        { name: "billingCycle", label: "Billing cycle", type: "select", required: true, defaultValue: s.billingCycle, options: [{ value: "MONTHLY", label: "Monthly" }, { value: "YEARLY", label: "Yearly" }] },
      ] } },
    { label: "Cancel subscription", action: cancelSubscription, input, destructive: true, hidden: !canManage || !live,
      form: { title: `Cancel ${s.code}?`, description: "Billing stops immediately. The seller can be reactivated later.", submitLabel: "Cancel subscription", fields: [{ name: "reason", label: "Reason", type: "textarea", required: true }] } },
    { label: "Reactivate subscription", action: reactivateSubscription, input, hidden: !canManage || !(s.status === "CANCELLED" || s.status === "EXPIRED"),
      confirm: { title: `Reactivate ${s.code}?`, description: "The subscription becomes active and renews one billing cycle from today.", confirmLabel: "Reactivate" } },
  ];
}
