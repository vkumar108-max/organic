import { ALL_PERMISSION_KEYS, type PermissionKey } from "./permissions";

export const SUPER_ADMIN_ROLE = "super_admin";

export const SYSTEM_ROLES: {
  key: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
}[] = [
  {
    key: SUPER_ADMIN_ROLE,
    name: "Super Admin",
    description: "Full, unrestricted control of the platform. Cannot be edited.",
    permissions: ALL_PERMISSION_KEYS,
  },
  {
    key: "admin",
    name: "Admin",
    description: "Operates the platform day to day. No user management, payouts or settings changes.",
    permissions: [
      "sellers.view", "sellers.manage", "stores.view", "stores.manage", "plans.view", "plans.manage",
      "subscriptions.view", "subscriptions.manage", "themes.view", "themes.manage", "orders.view",
      "customers.view", "payments.view", "payouts.view", "domains.view", "domains.manage",
      "support.view", "support.manage", "users.view", "analytics.view", "audit.view", "settings.view",
    ],
  },
  {
    key: "support_admin",
    name: "Support Admin",
    description: "Handles seller tickets with read access to the context needed to help.",
    permissions: [
      "sellers.view", "stores.view", "subscriptions.view", "orders.view", "customers.view",
      "domains.view", "support.view", "support.manage",
    ],
  },
  {
    key: "finance_admin",
    name: "Finance Admin",
    description: "Owns payments, payouts and billing visibility.",
    permissions: [
      "sellers.view", "stores.view", "plans.view", "subscriptions.view", "orders.view",
      "payments.view", "payouts.view", "payouts.manage", "analytics.view",
    ],
  },
  {
    key: "theme_manager",
    name: "Theme Manager",
    description: "Curates the theme marketplace.",
    permissions: ["themes.view", "themes.manage", "stores.view"],
  },
];
