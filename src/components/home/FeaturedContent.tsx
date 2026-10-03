import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";

const guides: { icon: IconName; title: string; text: string; href: string }[] = [
  { icon: "package", title: "Product guides", text: "Learn how to store and handle powders so they stay fresh.", href: "/blog/how-to-store-natural-powders" },
  { icon: "leaf", title: "Usage ideas", text: "Simple kitchen ideas for fruit, leaf and vegetable powders.", href: "/blog/five-ways-to-use-fruit-powder" },
  { icon: "tag", title: "Buying guides", text: "Pick the pack size that suits how you cook.", href: "/blog/buying-guide-choosing-pack-sizes" },
  { icon: "eye", title: "Food education", text: "Understand product labels and dried vegetables.", href: "/blog/reading-a-product-label" },
];

export function FeaturedContent() {
  return (
    <section aria-labelledby="guides" className="section">
      <div className="container-page">
        <SectionHeading id="guides" eyebrow="Learn" title="Helpful guides for your kitchen" description="Practical, factual information — no medical claims." href="/blog" linkLabel="All guides" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {guides.map((guide) => (
            <li key={guide.title}>
              <Link href={guide.href} className="group flex h-full flex-col gap-3 rounded-card border border-line bg-sand-50 p-5 transition hover:-translate-y-0.5 hover:shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-clay-500"><Icon name={guide.icon} /></span>
                <h3 className="font-sans text-lg font-semibold group-hover:text-brand-700">{guide.title}</h3>
                <p className="text-sm text-ink-soft">{guide.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
