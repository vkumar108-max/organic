import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog/CatalogView";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { JsonLd } from "@/components/ui/JsonLd";
import { ProductArt } from "@/components/ui/ProductArt";
import { parseCatalogParams, type SearchParams } from "@/lib/catalog-params";
import { repo } from "@/lib/data";
import { buildMetadata, categorySchema, faqSchema } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> };

// Pre-render every category at build time; new categories render on demand.
export async function generateStaticParams() {
  return (await repo.listCategories()).map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await repo.getCategory((await params).slug);
  if (!category) return { title: "Category not found", robots: { index: false } };
  return buildMetadata({ title: `${category.name} — Buy Online`, description: category.description.slice(0, 158), path: `/category/${category.slug}` });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = parseCatalogParams(await searchParams);
  const category = await repo.getCategory(slug);
  if (!category) notFound();

  const rawParams = await searchParams;
  const [result, others, all] = await Promise.all([
    repo.listProducts({ ...query, category: slug }),
    repo.listCategories(),
    repo.listProducts({ category: slug, pageSize: 20 }),
  ]);
  const related = others.filter((candidate) => candidate.slug !== slug).slice(0, 3);

  return (
    <div className="container-page pb-10">
      <JsonLd data={categorySchema(category, all.items)} />
      {category.faqs?.length ? <JsonLd data={faqSchema(category.faqs)} /> : null}
      <Breadcrumb items={[{ name: "Categories", href: "/categories" }, { name: category.name, href: `/category/${slug}` }]} />

      <header className="mb-8 grid items-center gap-6 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-50 to-sand-50 md:grid-cols-[1.4fr_1fr]">
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-semibold sm:text-4xl">{category.name}</h1>
          <p className="mt-3 max-w-xl text-ink-soft">{category.description}</p>
        </div>
        <div className="hidden h-full min-h-48 md:block" aria-hidden="true">
          <ProductArt tone={category.tone} label="" className="h-full w-full" />
        </div>
      </header>

      <CatalogView result={result} basePath={`/category/${slug}`} searchParams={rawParams} showCategoryFilter={false} sort={query.sort} noun={category.name.toLowerCase()} />

      {category.faqs?.length ? (
        <section aria-labelledby="category-faq" className="mt-16 max-w-3xl">
          <h2 id="category-faq" className="mb-4 text-2xl font-semibold">Useful information about {category.name}</h2>
          <Accordion items={category.faqs.map((faq, index) => ({ id: String(index), title: faq.question, content: <p className="text-ink-soft">{faq.answer}</p> }))} />
        </section>
      ) : null}

      <section aria-labelledby="related-categories" className="mt-16">
        <h2 id="related-categories" className="mb-4 text-2xl font-semibold">Related categories</h2>
        <ul className="flex flex-wrap gap-3">
          {related.map((item) => (
            <li key={item.id}><Link href={`/category/${item.slug}`} className="inline-block rounded-full border border-line px-5 py-2.5 font-medium hover:border-brand-500 hover:bg-brand-50">{item.name}</Link></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
