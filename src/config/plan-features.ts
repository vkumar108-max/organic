/**
 * Default catalogue of plan features. Plans store the *keys* they enable, so new features can be
 * added here (or typed as custom keys in the plan form) without schema changes.
 */
export const PLAN_FEATURE_CATALOG: { key: string; label: string }[] = [
  { key: "custom_domain", label: "Custom domain" },
  { key: "free_ssl", label: "Free SSL certificate" },
  { key: "premium_themes", label: "Premium themes" },
  { key: "discount_codes", label: "Discount codes" },
  { key: "abandoned_cart", label: "Abandoned cart recovery" },
  { key: "advanced_analytics", label: "Advanced analytics" },
  { key: "multi_staff", label: "Staff accounts" },
  { key: "api_access", label: "API access" },
  { key: "priority_support", label: "Priority support" },
  { key: "remove_branding", label: "Remove STORELAUNCH branding" },
  { key: "multi_currency", label: "Multi-currency" },
  { key: "bulk_import", label: "Bulk product import" },
];

export function featureLabel(key: string): string {
  return (
    PLAN_FEATURE_CATALOG.find((f) => f.key === key)?.label ??
    key.replace(/[_-]+/g, " ").replace(/^\w/, (c) => c.toUpperCase())
  );
}
