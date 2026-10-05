import { Star } from "lucide-react";
import { ThemeStatus } from "@prisma/client";
import { requirePermission } from "@/server/rbac/context";
import { parseListParams, type RawSearchParams } from "@/lib/list-params";
import { listThemes, THEME_SORTABLE } from "@/server/themes/queries";
import { db } from "@/server/db";
import { PageHeader } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/data/data-table";
import { FilterBar } from "@/components/data/filter-bar";
import { ActionButton, RowActions } from "@/components/data/action-dialog";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { humanize } from "@/config/statuses";
import { formatDate } from "@/lib/format";
import { Cell2 } from "@/features/shared/ui";
import { createThemeAction, themeActions } from "@/features/themes/theme-actions";

export const metadata = { title: "Themes" };

export default async function ThemesPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const ctx = await requirePermission("themes.view");
  const params = parseListParams(await searchParams, { sortable: THEME_SORTABLE, defaultSort: "updatedAt", filters: ["status", "category", "featured", "active"] });
  const [{ rows, total }, cats] = await Promise.all([listThemes(params), db.themeCategory.findMany({ orderBy: { sortOrder: "asc" } })]);
  const manage = ctx.can("themes.manage");
  type Row = (typeof rows)[number];
  const columns: Column<Row>[] = [
    { key: "name", header: "Theme", sort: "name", mobile: "title", cell: (t) => (
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {t.previewImageUrl ? <img src={t.previewImageUrl} alt="" referrerPolicy="no-referrer" className="h-10 w-16 shrink-0 rounded border border-slate-200 object-cover" /> : <div className="h-10 w-16 shrink-0 rounded border border-dashed border-slate-300 bg-slate-50" />}
        <Cell2 primary={<span className="flex items-center gap-1.5">{t.name}{t.isFeatured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-label="Featured" />}</span>} secondary={`${t._count.stores} ${t._count.stores === 1 ? "store" : "stores"}`} />
      </div>) },
    { key: "category", header: "Category", cell: (t) => t.category.name },
    { key: "status", header: "Status", sort: "status", cell: (t) => <span className="flex gap-1.5"><StatusBadge status={t.status} />{!t.isActive && <Badge tone="slate">Inactive</Badge>}</span> },
    { key: "version", header: "Version", sort: "version", cell: (t) => `v${t.version}` },
    { key: "featured", header: "Featured", cell: (t) => (t.isFeatured ? "Yes" : "No") },
    { key: "createdAt", header: "Created", sort: "createdAt", cell: (t) => formatDate(t.createdAt) },
    { key: "updatedAt", header: "Updated", sort: "updatedAt", cell: (t) => formatDate(t.updatedAt) },
    { key: "actions", header: "", mobile: "actions", sticky: true, className: "w-10 text-right", cell: (t) => <RowActions actions={themeActions(t, manage, cats)} /> },
  ];
  return (
    <>
      <PageHeader title="Themes" description="Manage the themes sellers can choose from. Theme building happens elsewhere." actions={manage && <ActionButton variant="primary" def={createThemeAction(cats)} />} />
      <FilterBar searchPlaceholder="Search themes…" filters={[
        { name: "category", label: "Category", options: cats.map((c) => ({ value: c.key, label: c.name })) },
        { name: "status", label: "Status", options: Object.values(ThemeStatus).map((v) => ({ value: v, label: humanize(v) })) },
        { name: "featured", label: "Featured", options: [{ value: "yes", label: "Featured" }, { value: "no", label: "Not featured" }] },
        { name: "active", label: "Active", options: [{ value: "yes", label: "Active" }, { value: "no", label: "Inactive" }] },
      ]} />
      <DataTable columns={columns} rows={rows} rowKey={(t) => t.id} params={params} basePath="/themes" total={total} emptyTitle="No themes found" />
    </>
  );
}
