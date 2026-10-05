import "server-only";
import { db } from "./db";
import type { AuthContext } from "./rbac/context";

/** Header bell: actionable counts, each limited to what the admin is allowed to see. */
export async function getNotifications(ctx: AuthContext) {
  const [pendingSellers, urgentTickets, pendingPayouts, failedDomains] = await Promise.all([
    ctx.can("sellers.view") ? db.seller.count({ where: { status: "PENDING" } }) : 0,
    ctx.can("support.view") ? db.supportTicket.count({ where: { priority: { in: ["URGENT", "HIGH"] }, status: { in: ["OPEN", "IN_PROGRESS"] } } }) : 0,
    ctx.can("payouts.view") ? db.payout.count({ where: { status: "PENDING" } }) : 0,
    ctx.can("domains.view") ? db.domain.count({ where: { status: "FAILED" } }) : 0,
  ]);
  return [
    { label: "sellers awaiting approval", count: pendingSellers, href: "/sellers?status=PENDING" },
    { label: "high-priority open tickets", count: urgentTickets, href: "/support?priority=URGENT" },
    { label: "payouts pending", count: pendingPayouts, href: "/payouts?status=PENDING" },
    { label: "domains failed verification", count: failedDomains, href: "/domains?status=FAILED" },
  ].filter((n) => n.count > 0);
}
