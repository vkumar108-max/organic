import type { Plan } from "@prisma/client";
import type { ActionDef, FormField } from "@/components/data/action-dialog";
import { createPlan, setPlanActive, updatePlan } from "@/server/plans/actions";
import { PLAN_FEATURE_CATALOG } from "@/config/plan-features";

const catalogKeys = new Set(PLAN_FEATURE_CATALOG.map((f) => f.key));

function planFields(p?: Plan): FormField[] {
  const features = (p?.features as string[] | undefined) ?? [];
  return [
    { name: "name", label: "Plan name", required: true, defaultValue: p?.name ?? "" },
    { name: "description", label: "Description", type: "textarea", defaultValue: p?.description ?? "" },
    { name: "monthlyPrice", label: "Monthly price (USD)", type: "number", step: "0.01", required: true, defaultValue: p ? Number(p.monthlyPrice) : 0 },
    { name: "yearlyPrice", label: "Yearly price (USD)", type: "number", step: "0.01", required: true, defaultValue: p ? Number(p.yearlyPrice) : 0 },
    { name: "trialDays", label: "Trial period (days)", type: "number", required: true, defaultValue: p?.trialDays ?? 0 },
    { name: "productLimit", label: "Product limit", type: "number", nullable: true, help: "Leave blank for unlimited", defaultValue: p?.productLimit ?? null },
    { name: "orderLimit", label: "Orders per month", type: "number", nullable: true, help: "Leave blank for unlimited", defaultValue: p?.orderLimit ?? null },
    { name: "storageLimitMb", label: "Storage limit (MB)", type: "number", nullable: true, help: "Leave blank for unlimited", defaultValue: p?.storageLimitMb ?? null },
    { name: "features", label: "Features", type: "checkboxes", options: PLAN_FEATURE_CATALOG.map((f) => ({ value: f.key, label: f.label })), defaultValue: features.filter((f) => catalogKeys.has(f)) },
    { name: "customFeatures", label: "Additional feature keys", help: "Comma separated, e.g. white_label, sso", defaultValue: features.filter((f) => !catalogKeys.has(f)).join(", ") },
    { name: "isActive", label: "Active (available to sellers)", type: "checkbox", defaultValue: p?.isActive ?? true },
    { name: "isPopular", label: "Highlight as “Most popular”", type: "checkbox", defaultValue: p?.isPopular ?? false },
  ];
}

export const createPlanAction = (): ActionDef => ({
  label: "Create plan", action: createPlan,
  form: { title: "Create plan", description: "Define pricing, limits and the features this plan unlocks.", fields: planFields(), submitLabel: "Create plan", size: "lg" },
});

export const editPlanAction = (p: Plan): ActionDef => ({
  label: "Edit plan", action: updatePlan, input: { id: p.id },
  form: { title: `Edit ${p.name}`, fields: planFields(p), submitLabel: "Save changes", size: "lg" },
});

export const togglePlanAction = (p: Plan): ActionDef => p.isActive
  ? { label: "Deactivate", action: setPlanActive, input: { id: p.id, active: false }, destructive: true,
      confirm: { title: `Deactivate ${p.name}?`, description: "Existing subscribers keep this plan, but sellers can no longer choose or be moved to it.", confirmLabel: "Deactivate" } }
  : { label: "Activate", action: setPlanActive, input: { id: p.id, active: true }, confirm: { title: `Activate ${p.name}?`, description: "Sellers will be able to choose this plan.", confirmLabel: "Activate" } };
