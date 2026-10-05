import type { PermissionKey } from "./permissions";

export type NavIcon =
  | "overview" | "sellers" | "stores" | "plans" | "subscriptions" | "themes" | "orders" | "customers"
  | "payments" | "payouts" | "domains" | "support" | "users" | "analytics" | "audit" | "settings";

export type NavItem = { label: string; href: string; icon: NavIcon; permission: PermissionKey | null; title: string };

/** `permission: null` = any authenticated admin. Widgets inside are permission-gated individually. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/", icon: "overview", permission: null, title: "Platform overview" },
  { label: "Sellers", href: "/sellers", icon: "sellers", permission: "sellers.view", title: "Sellers" },
  { label: "Stores", href: "/stores", icon: "stores", permission: "stores.view", title: "Stores" },
  { label: "Plans & Pricing", href: "/plans", icon: "plans", permission: "plans.view", title: "Plans & pricing" },
  { label: "Subscriptions", href: "/subscriptions", icon: "subscriptions", permission: "subscriptions.view", title: "Subscriptions" },
  { label: "Themes", href: "/themes", icon: "themes", permission: "themes.view", title: "Themes" },
  { label: "Orders", href: "/orders", icon: "orders", permission: "orders.view", title: "Orders" },
  { label: "Customers", href: "/customers", icon: "customers", permission: "customers.view", title: "Customers" },
  { label: "Payments", href: "/payments", icon: "payments", permission: "payments.view", title: "Payments" },
  { label: "Payouts", href: "/payouts", icon: "payouts", permission: "payouts.view", title: "Payouts" },
  { label: "Domains", href: "/domains", icon: "domains", permission: "domains.view", title: "Domains" },
  { label: "Support", href: "/support", icon: "support", permission: "support.view", title: "Support" },
  { label: "Users & Roles", href: "/users", icon: "users", permission: "users.view", title: "Users & roles" },
  { label: "Analytics", href: "/analytics", icon: "analytics", permission: "analytics.view", title: "Analytics" },
  { label: "Audit Logs", href: "/audit-logs", icon: "audit", permission: "audit.view", title: "Audit logs" },
  { label: "Settings", href: "/settings", icon: "settings", permission: "settings.view", title: "Settings" },
];

export function titleForPath(pathname: string): string {
  const match = [...NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((n) => (n.href === "/" ? pathname === "/" : pathname === n.href || pathname.startsWith(n.href + "/")));
  return match?.title ?? "Admin";
}
