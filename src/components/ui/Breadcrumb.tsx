import Link from "next/link";
import { breadcrumbSchema, type Crumb } from "@/lib/seo";
import { Icon } from "./Icon";
import { JsonLd } from "./JsonLd";

/** Visible breadcrumb trail + BreadcrumbList structured data. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ name: "Home", href: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="py-3 text-sm">
      <JsonLd data={breadcrumbSchema(all)} />
      <ol className="flex flex-wrap items-center gap-1 text-ink-soft">
        {all.map((crumb, index) => {
          const last = index === all.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="font-medium text-ink">{crumb.name}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-brand-700 hover:underline">{crumb.name}</Link>
              )}
              {!last && <Icon name="chevronRight" size={14} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
