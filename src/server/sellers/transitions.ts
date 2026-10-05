import type { SellerStatus } from "@prisma/client";

export type SellerAction = "approve" | "reject" | "suspend" | "block" | "reactivate";

/** Allowed status changes. Pure & unit-tested; the server action enforces it, the UI only mirrors it. */
export const SELLER_TRANSITIONS: Record<SellerAction, { from: SellerStatus[]; to: SellerStatus }> = {
  approve: { from: ["PENDING", "REJECTED"], to: "ACTIVE" },
  reject: { from: ["PENDING"], to: "REJECTED" },
  suspend: { from: ["ACTIVE"], to: "SUSPENDED" },
  block: { from: ["ACTIVE", "SUSPENDED"], to: "BLOCKED" },
  reactivate: { from: ["SUSPENDED", "BLOCKED"], to: "ACTIVE" },
};

export const canTransition = (action: SellerAction, status: SellerStatus) => SELLER_TRANSITIONS[action].from.includes(status);
