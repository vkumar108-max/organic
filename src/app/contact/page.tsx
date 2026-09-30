import { ContactForm } from "@/components/layout/ContactForm";
import { PageShell } from "@/components/layout/PageShell";
import { Icon } from "@/components/ui/Icon";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Contact Us", description: `Get in touch with ${site.name} for order help and product questions.`, path: "/contact" });

export default function ContactPage() {
  const details = [
    { icon: "mail" as const, label: "Email", value: site.contact.email },
    { icon: "phone" as const, label: "Phone", value: site.contact.phone },
    { icon: "pin" as const, label: "Address", value: site.contact.address },
    { icon: "clock" as const, label: "Support hours", value: site.contact.hours },
  ];
  return (
    <PageShell title="Contact Us" path="/contact" intro="Questions about an order or a product? Send us a message.">
      <div className="grid gap-10 lg:grid-cols-2">
        <ContactForm />
        <div>
          <ul className="space-y-4">
            {details.map((detail) => (
              <li key={detail.label} className="flex gap-4 rounded-card border border-line p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700"><Icon name={detail.icon} size={18} /></span>
                <div><p className="text-sm text-ink-soft">{detail.label}</p><p className="font-medium">{detail.value}</p></div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-soft">Contact details are placeholders — set them in src/config/site.ts.</p>
        </div>
      </div>
    </PageShell>
  );
}
