/** Static permission catalog. Seeded into the Permission table; enforced server-side. */
export const PERMISSION_GROUPS = [
  { group: "Sellers", items: [["sellers.view", "View sellers"], ["sellers.manage", "Approve, reject, suspend, block sellers and change plans"]] },
  { group: "Stores", items: [["stores.view", "View stores"], ["stores.manage", "Activate, suspend or disable stores"]] },
  { group: "Plans", items: [["plans.view", "View plans"], ["plans.manage", "Create and edit plans"]] },
  { group: "Subscriptions", items: [["subscriptions.view", "View subscriptions"], ["subscriptions.manage", "Change, cancel, reactivate subscriptions"]] },
  { group: "Themes", items: [["themes.view", "View themes"], ["themes.manage", "Create, edit, publish themes"]] },
  { group: "Orders", items: [["orders.view", "View platform orders"]] },
  { group: "Customers", items: [["customers.view", "View customers"]] },
  { group: "Payments", items: [["payments.view", "View payment records"]] },
  { group: "Payouts", items: [["payouts.view", "View payouts"], ["payouts.manage", "Approve, process and settle payouts"]] },
  { group: "Domains", items: [["domains.view", "View domains"], ["domains.manage", "Verify and disable domains"]] },
  { group: "Support", items: [["support.view", "View tickets"], ["support.manage", "Assign, reply, resolve tickets"]] },
  { group: "Users & Roles", items: [["users.view", "View admin users and roles"], ["users.manage", "Create users, edit roles & permissions"]] },
  { group: "Analytics", items: [["analytics.view", "View platform analytics"]] },
  { group: "Audit", items: [["audit.view", "View audit logs"]] },
  { group: "Settings", items: [["settings.view", "View platform settings"], ["settings.manage", "Change platform settings"]] },
] as const;

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) =>
  g.items.map(([key, description]) => ({ key, description, group: g.group })),
);

export type PermissionKey = (typeof PERMISSION_GROUPS)[number]["items"][number][0];

export const ALL_PERMISSION_KEYS = ALL_PERMISSIONS.map((p) => p.key) as PermissionKey[];
