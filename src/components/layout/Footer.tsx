import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { footerLinks, paymentOptions, site } from "@/config/site";
import { repo } from "@/lib/data";

function Column({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="mb-3 font-sans text-sm font-bold uppercase tracking-wider text-white">{title}</h2>
      <ul className="space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.label}><Link href={link.href} className="text-brand-100/80 hover:text-white hover:underline">{link.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const categories = await repo.listCategories();
  const enabledPayments = paymentOptions.filter((option) => option.enabled);
  return (
    <footer className="mt-16 bg-brand-900 pb-20 text-brand-100 md:pb-0">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-brand-100/80">{site.description}</p>
          <ul className="mt-5 flex gap-2">
            {site.social.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${site.name} on ${link.label}`} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                  <Icon name={link.icon} size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <Column title="Quick links" links={footerLinks.quick} />
        <Column title="Shop" links={categories.map((category) => ({ label: category.name, href: `/category/${category.slug}` }))} />
        <Column title="Customer support" links={footerLinks.support} />
        <Column title="Policies" links={footerLinks.policies} />
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-brand-100/70 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All Rights Reserved.</p>
          <ul className="flex flex-wrap items-center justify-center gap-2" aria-label="Accepted payment methods">
            {enabledPayments.map((option) => (
              <li key={option.id} className="rounded border border-white/20 px-2 py-0.5 text-[0.7rem]">{option.id === "cod" ? "COD" : option.id === "netbanking" ? "Net Banking" : option.id.toUpperCase()}</li>
            ))}
          </ul>
        </div>
        {site.dataMode === "demo" && (
          <p className="bg-black/20 px-4 py-2 text-center text-xs text-brand-100/80">
            Demo mode: products, reviews and blog articles are sample content and orders are not saved.
          </p>
        )}
      </div>
    </footer>
  );
}
