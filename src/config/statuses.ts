/** Badge tone per status value. One place so every table/detail view renders statuses identically. */
export type Tone = "green" | "amber" | "red" | "blue" | "gray" | "purple" | "slate";

export const STATUS_TONES: Record<string, Tone> = {
  // seller
  PENDING: "amber", ACTIVE: "green", SUSPENDED: "amber", BLOCKED: "red", REJECTED: "red",
  // store
  DRAFT: "gray", DISABLED: "slate",
  // subscription
  TRIAL: "blue", PAST_DUE: "amber", CANCELLED: "red", EXPIRED: "slate",
  // invoice / payment
  PAID: "green", OPEN: "blue", FAILED: "red", REFUNDED: "purple",
  // theme
  PUBLISHED: "green", UNPUBLISHED: "slate",
  // order
  CONFIRMED: "blue", PROCESSING: "blue", SHIPPED: "purple", DELIVERED: "green",
  // payout
  COMPLETED: "green",
  // domain
  VERIFYING: "blue", VERIFIED: "green", NONE: "gray",
  // ticket status
  IN_PROGRESS: "blue", WAITING: "amber", RESOLVED: "green", CLOSED: "slate",
  // priority
  LOW: "gray", MEDIUM: "blue", HIGH: "amber", URGENT: "red",
  // misc
  true: "green", false: "gray",
};

export function humanize(value: string): string {
  return value.toLowerCase().replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()).replace(/ (\w)/g, (_, c) => " " + c);
}
