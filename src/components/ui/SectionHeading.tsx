import Link from "next/link";
import { Icon } from "./Icon";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  align?: "left" | "center";
  /** id applied to the <h2>, referenced by the section's aria-labelledby */
  id?: string;
}

export function SectionHeading({ eyebrow, title, description, href, linkLabel, align = "left", id }: SectionHeadingProps) {
  return (
    <div className={`mb-7 flex flex-wrap items-end justify-between gap-3 ${align === "center" ? "flex-col items-center text-center" : ""}`}>
      <div className={align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-clay-500">{eyebrow}</p>}
        <h2 id={id} className="text-2xl font-semibold sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 text-ink-soft">{description}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
          {linkLabel} <Icon name="arrowRight" size={16} />
        </Link>
      )}
    </div>
  );
}
