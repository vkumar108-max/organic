import type { StoreStatus } from "@prisma/client";

export type StoreAction = "activate" | "suspend" | "disable";

export const STORE_TRANSITIONS: Record<StoreAction, { from: StoreStatus[]; to: StoreStatus }> = {
  activate: { from: ["DRAFT", "SUSPENDED", "DISABLED"], to: "ACTIVE" },
  suspend: { from: ["ACTIVE"], to: "SUSPENDED" },
  disable: { from: ["DRAFT", "ACTIVE", "SUSPENDED"], to: "DISABLED" },
};

export const canStoreTransition = (a: StoreAction, s: StoreStatus) => STORE_TRANSITIONS[a].from.includes(s);
