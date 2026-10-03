import type { Metadata } from "next";
import Link from "next/link";
import { BlogCard } from "@/components/blog/BlogCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { ProductArt } from "@/components/ui/ProductArt";
import { blogCategories } from "@/data/demo/blog";
import type { SearchParams } from "@/lib/catalog-params";
import { repo } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Blog — Guides, Recipes & Natural Food Information",
  description: "Practical product guides, buying guides and everyday uses for fruit, leaf and vegetable powders and dry vegetables.",
  path: "/blog",
});

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function BlogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = one(params.q)?.slice(0, 60);
  const category = one(params.category);
  const filtered = Boolean(q || category);
  const posts = await repo.listBlogPosts({ q, category });
  const featured = !filtered ? posts.find((post) => post.featured) : undefined;
  const latest = featured ? posts.filter((post) => post.id !== featured.id) : posts;
  const popular = [...posts].sort((a, b) => b.popularity - a.popularity).slice(0, 4);

  return (
    <div className="container-page pb-10">
      <Breadcrumb items={[{ name: "Blog", href: "/blog" }]} />
      <h1 className="text-3xl font-semibold sm:text-4xl">Blog</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">Guides, buying tips and simple kitchen ideas.</p>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form role="search" action="/blog" className="relative w-full md:max-w-sm">
          <label htmlFor="blog-search" className="sr-only">Search articles</label>
          <Icon name="search" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input id="blog-search" name="q" defaultValue={q} placeholder="Search articles" className="w-full rounded-full border border-line py-2.5 pl-11 pr-4" />
        </form>
        <ul className="flex flex-wrap gap-2" aria-label="Article categories">
          <li><Link href="/blog" className={`rounded-full border px-4 py-1.5 text-sm ${!category ? "border-brand-600 bg-brand-600 text-white" : "border-line hover:bg-brand-50"}`}>All</Link></li>
          {blogCategories.map((name) => (
            <li key={name}><Link href={`/blog?category=${encodeURIComponent(name)}`} className={`rounded-full border px-4 py-1.5 text-sm ${category === name ? "border-brand-600 bg-brand-600 text-white" : "border-line hover:bg-brand-50"}`}>{name}</Link></li>
          ))}
        </ul>
      </div>

      {posts.length === 0 ? (
        <EmptyState icon="search" title="No articles found" description="Try a different search or category." action={{ label: "View all articles", href: "/blog" }} />
      ) : (
        <>
          {featured && (
            <article className="mt-8 grid overflow-hidden rounded-3xl border border-line bg-brand-50/60 md:grid-cols-2">
              <div className="aspect-[16/10] md:aspect-auto"><ProductArt tone={featured.tone} label="" className="h-full w-full" /></div>
              <div className="flex flex-col justify-center gap-3 p-6 sm:p-10">
                <p className="text-xs font-bold uppercase tracking-wider text-clay-500">Featured · {featured.category}</p>
                <h2 className="text-2xl font-semibold sm:text-3xl"><Link href={`/blog/${featured.slug}`} className="hover:text-brand-700">{featured.title}</Link></h2>
                <p className="text-ink-soft">{featured.excerpt}</p>
                <p className="text-sm text-ink-soft">{formatDate(featured.publishedAt)} · {featured.readingMinutes} min read</p>
              </div>
            </article>
          )}

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_18rem]">
            <section aria-labelledby="latest">
              <h2 id="latest" className="mb-5 text-2xl font-semibold">{filtered ? "Results" : "Latest articles"}</h2>
              <ul className="grid gap-5 sm:grid-cols-2">{latest.map((post) => <li key={post.id}><BlogCard post={post} /></li>)}</ul>
            </section>
            <aside aria-labelledby="popular" className="lg:sticky lg:top-40 lg:self-start">
              <h2 id="popular" className="mb-4 text-xl font-semibold">Popular articles</h2>
              <ol className="space-y-4">
                {popular.map((post, index) => (
                  <li key={post.id} className="flex gap-3">
                    <span className="font-display text-2xl text-brand-300" aria-hidden="true">{index + 1}</span>
                    <Link href={`/blog/${post.slug}`} className="font-medium hover:text-brand-700">{post.title}</Link>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
