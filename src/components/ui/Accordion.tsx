import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

/** Native <details>: keyboard accessible, no JavaScript, content stays in the HTML for SEO. */
export function Accordion({ items, defaultOpen }: { items: AccordionItem[]; defaultOpen?: string }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-card border border-line">
      {items.map((item) => (
        <details key={item.id} open={item.id === defaultOpen} className="group bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold hover:bg-brand-50 [&::-webkit-details-marker]:hidden">
            <h3 className="font-sans text-base font-semibold">{item.title}</h3>
            <Icon name="chevronDown" size={18} className="shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-5">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
