import { PageShell } from "@/components/layout/PageShell";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { demoFaqGroups } from "@/data/demo/faqs";
import { buildMetadata, faqSchema } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Frequently Asked Questions", description: "Answers about ordering, payments, shipping and our products.", path: "/faq" });

export default function FaqPage() {
  return (
    <PageShell title="Frequently Asked Questions" path="/faq" intro="Can’t find what you need? Contact us and we’ll help.">
      <JsonLd data={faqSchema(demoFaqGroups.flatMap((group) => group.items))} />
      <div className="max-w-3xl space-y-8">
        {demoFaqGroups.map((group) => (
          <section key={group.title} aria-label={group.title}>
            <h2 className="mb-3 text-xl font-semibold">{group.title}</h2>
            <Accordion items={group.items.map((item, index) => ({ id: `${group.title}-${index}`, title: item.question, content: <p className="text-ink-soft">{item.answer}</p> }))} />
          </section>
        ))}
      </div>
    </PageShell>
  );
}
