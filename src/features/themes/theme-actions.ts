import type { Theme } from "@prisma/client";
import type { ActionDef, FormField } from "@/components/data/action-dialog";
import { createTheme, publishTheme, setThemeActive, setThemeFeatured, unpublishTheme, updateTheme } from "@/server/themes/actions";

type Cat = { id: string; name: string };

const fields = (cats: Cat[], t?: Theme): FormField[] => [
  { name: "name", label: "Theme name", required: true, defaultValue: t?.name ?? "" },
  { name: "categoryId", label: "Category", type: "select", required: true, defaultValue: t?.categoryId ?? cats[0]?.id ?? "", options: cats.map((c) => ({ value: c.id, label: c.name })) },
  { name: "version", label: "Version", required: true, defaultValue: t?.version ?? "1.0.0", help: "Semantic version, e.g. 1.2.0" },
  { name: "previewImageUrl", label: "Preview image URL", type: "url", defaultValue: t?.previewImageUrl ?? "", placeholder: "https://… or /theme-previews/fashion.svg" },
  { name: "description", label: "Description", type: "textarea", defaultValue: t?.description ?? "" },
  { name: "isFeatured", label: "Featured theme", type: "checkbox", defaultValue: t?.isFeatured ?? false },
];

export const createThemeAction = (cats: Cat[]): ActionDef => ({ label: "Create theme", action: createTheme, form: { title: "Create theme", description: "Themes start as drafts. Publish when ready.", fields: fields(cats), submitLabel: "Create theme" } });

export function themeActions(t: Theme, canManage: boolean, cats: Cat[]): ActionDef[] {
  const input = { id: t.id };
  return [
    { label: "Edit metadata", action: updateTheme, input, hidden: !canManage, form: { title: `Edit ${t.name}`, fields: fields(cats, t), submitLabel: "Save changes" } },
    { label: "Publish theme", action: publishTheme, input, hidden: !canManage || t.status === "PUBLISHED", confirm: { title: `Publish ${t.name}?`, description: "It becomes selectable by sellers in the theme gallery.", confirmLabel: "Publish" } },
    { label: "Unpublish theme", action: unpublishTheme, input, destructive: true, hidden: !canManage || t.status !== "PUBLISHED", confirm: { title: `Unpublish ${t.name}?`, description: "It disappears from the theme gallery. Stores that already use it keep working.", confirmLabel: "Unpublish" } },
    { label: t.isFeatured ? "Remove from featured" : "Mark as featured", action: setThemeFeatured, input: { ...input, featured: !t.isFeatured }, hidden: !canManage },
    { label: "Activate theme", action: setThemeActive, input: { ...input, active: true }, hidden: !canManage || t.isActive },
    { label: "Deactivate theme", action: setThemeActive, input: { ...input, active: false }, destructive: true, hidden: !canManage || !t.isActive, confirm: { title: `Deactivate ${t.name}?`, description: "Deactivated themes can't be selected or featured. Existing stores are unaffected.", confirmLabel: "Deactivate" } },
  ];
}
