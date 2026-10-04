import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/format";

/** Wordmark + leaf mark. Swap the SVG for the real logo file when available. */
export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 font-display", className)} aria-label={`${site.name} — home`}>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <rect width="34" height="34" rx="10" fill={light ? "#fff" : "var(--color-brand-600)"} />
        <path d="M9 24c0-8 4.500-13 15-13 0 9-5 14-13 14" fill={light ? "var(--color-brand-600)" : "#fff"} opacity=".95" />
        <path d="M9 25c2.500-4 5.500-7 9-9" stroke={light ? "#fff" : "var(--color-brand-600)"} strokeWidth="1.600" strokeLinecap="round" fill="none" />
      </svg>
      <span className={cn("whitespace-nowrap text-lg sm:text-xl font-semibold tracking-tight leading-none", light ? "text-white" : "text-brand-800")}>{site.name}</span>
    </Link>
  );
}
