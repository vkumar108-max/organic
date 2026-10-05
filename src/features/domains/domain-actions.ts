import type { DomainStatus } from "@prisma/client";
import type { ActionDef } from "@/components/data/action-dialog";
import { disableDomain, enableDomain, retryDomain, verifyDomain } from "@/server/domains/actions";

export function domainActions(d: { id: string; hostname: string; status: DomainStatus }, canManage: boolean): ActionDef[] {
  const input = { id: d.id };
  return [
    { label: "Mark as verified", action: verifyDomain, input, hidden: !canManage || !["PENDING", "VERIFYING", "FAILED"].includes(d.status),
      confirm: { title: `Mark ${d.hostname} as verified?`, description: "Manual override: use only after confirming DNS ownership yourself.", confirmLabel: "Mark verified" } },
    { label: "Retry verification", action: retryDomain, input, hidden: !canManage || !["PENDING", "FAILED"].includes(d.status) },
    { label: "Disable domain", action: disableDomain, input, destructive: true, hidden: !canManage || d.status === "DISABLED",
      confirm: { title: `Disable ${d.hostname}?`, description: "The domain stops resolving to the store until re-enabled and verified again.", confirmLabel: "Disable" } },
    { label: "Re-enable domain", action: enableDomain, input, hidden: !canManage || d.status !== "DISABLED" },
  ];
}
