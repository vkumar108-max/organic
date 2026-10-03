import Link from "next/link";
import { cn } from "@/lib/format";
import { Icon } from "./Icon";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Builds the href for a page number, preserving current filters */
  hrefFor: (page: number) => string;
}

/** Link-based pagination: crawlable, works without JavaScript. */
export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (candidate) => candidate === 1 || candidate === totalPages || Math.abs(candidate - page) <= 1,
  );
  const item = "grid h-10 min-w-10 place-items-center rounded-full border px-3 text-sm font-medium";
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} rel="prev" className={cn(item, "border-line hover:bg-brand-50")} aria-label="Previous page">
          <Icon name="chevronLeft" size={16} />
        </Link>
      )}
      {pages.map((candidate, index) => (
        <span key={candidate} className="flex items-center gap-2">
          {index > 0 && candidate - pages[index - 1] > 1 && <span aria-hidden="true">…</span>}
          <Link
            href={hrefFor(candidate)}
            aria-current={candidate === page ? "page" : undefined}
            className={cn(item, candidate === page ? "border-brand-600 bg-brand-600 text-white" : "border-line hover:bg-brand-50")}
          >
            <span className="sr-only">Page </span>
            {candidate}
          </Link>
        </span>
      ))}
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} rel="next" className={cn(item, "border-line hover:bg-brand-50")} aria-label="Next page">
          <Icon name="chevronRight" size={16} />
        </Link>
      )}
    </nav>
  );
}
