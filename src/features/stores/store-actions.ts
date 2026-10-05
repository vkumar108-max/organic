import type { StoreStatus } from "@prisma/client";
import type { ActionDef } from "@/components/data/action-dialog";
import { activateStore, disableStore, suspendStore } from "@/server/stores/actions";
import { canStoreTransition } from "@/server/stores/transitions";

const reason = { name: "reason", label: "Reason", type: "textarea" as const, required: true, help: "Recorded in the audit log." };

export function storeActions(s: { id: string; name: string; status: StoreStatus }, canManage: boolean): ActionDef[] {
  const input = { id: s.id };
  return [
    { label: "Activate store", action: activateStore, input, hidden: !canManage || !canStoreTransition("activate", s.status),
      confirm: { title: `Activate ${s.name}?`, description: "The store will go live on its domain.", confirmLabel: "Activate" } },
    { label: "Suspend store", action: suspendStore, input, destructive: true, hidden: !canManage || !canStoreTransition("suspend", s.status),
      form: { title: `Suspend ${s.name}?`, description: "The storefront goes offline until reactivated.", fields: [reason], submitLabel: "Suspend" } },
    { label: "Disable store", action: disableStore, input, destructive: true, hidden: !canManage || !canStoreTransition("disable", s.status),
      form: { title: `Disable ${s.name}?`, description: "Disabling permanently takes the store out of service. It can be re-activated later by an admin.", fields: [reason], submitLabel: "Disable store" } },
  ];
}
