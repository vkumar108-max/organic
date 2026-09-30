import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

interface PageShellProps {
  title: string;
  path: string;
  intro?: string;
  children: ReactNode;
  /** Narrow reading width for text pages */
  narrow?: boolean;
}

export function PageShell({ title, path, intro, children, narrow }: PageShellProps) {
  return (
    <div className="container-page pb-12">
      <Breadcrumb items={[{ name: title, href: path }]} />
      <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
      {intro && <p className="mt-3 max-w-2xl text-ink-soft">{intro}</p>}
      <div className={`mt-8 ${narrow ? "prose-content" : ""}`}>{children}</div>
    </div>
  );
}
