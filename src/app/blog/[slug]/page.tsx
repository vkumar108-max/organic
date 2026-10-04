import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blog/BlogCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { JsonLd } from "@/components/ui/JsonLd";
import { ProductArt } from "@/components/ui/ProductArt";
import { repo } from "@/lib/data";
import { absoluteUrl, formatDate } from "@/lib/format";
import { articleSchema, buildMetadata, faqSchema } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await repo.listBlogPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await repo.getBlogPost((await params).slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  return buildMetadata({ title: post.title, description: post.excerpt, path: `/blog/${post.slug}`, type: "article" });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await repo.getBlogPost(slug);
  if (!post) notFound();

  const [all, products] = await Promise.all([
    repo.listBlogPosts(),
    post.relatedProductSlugs?.length ? repo.listProducts({ slugs: post.relatedProductSlugs, pageSize: 4 }) : Promise.resolve(null),
  ]);
  const related = all.filter((candidate) => candidate.id !== post.id && candidate.category === post.category).concat(all.filter((candidate) => candidate.id !== post.id && candidate.category !== post.category)).slice(0, 3);
  const url = encodeURIComponent(absoluteUrl(`/blog/${post.slug}`));
  const title = encodeURIComponent(post.title);
  const shares = [
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { label: "X", href: `https://x.com/intent/post?url=${url}&text=${title}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${title}%20${url}` },
  ];

  return (
    <article className="container-page pb-10">
      <JsonLd data={articleSchema(post)} />
      {post.faqs?.length ? <JsonLd data={faqSchema(post.faqs)} /> : null}
      <Breadcrumb items={[{ name: "Blog", href: "/blog" }, { name: post.title, href: `/blog/${post.slug}` }]} />

      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-wider text-clay-500">{post.category}</p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-sm text-ink-soft">
          By <span className="font-medium text-ink">{post.author}</span> · <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> · {post.readingMinutes} min read
        </p>
      </header>

      <div className="my-8 aspect-[16/8] max-w-4xl overflow-hidden rounded-3xl"><ProductArt tone={post.tone} label={`Illustration for ${post.title}`} className="h-full w-full" /></div>

      <div className="prose-content">
        {post.body.map((block, index) => {
          if (block.type === "h2") return <h2 key={index}>{block.text}</h2>;
          if (block.type === "h3") return <h3 key={index}>{block.text}</h3>;
          if (block.type === "ul") return <ul key={index}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
          return <p key={index}>{block.text}</p>;
        })}
        <p className="rounded-lg bg-sand-50 p-4 text-sm">This article is general information about food products, not medical advice. See our <Link href="/disclaimer">Disclaimer</Link>.</p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold">Share:</span>
        {shares.map((share) => (
          <a key={share.label} href={share.href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-4 py-1.5 text-sm hover:bg-brand-50">{share.label}<span className="sr-only"> (opens in a new tab)</span></a>
        ))}
      </div>

      {post.faqs?.length ? (
        <section aria-labelledby="post-faq" className="mt-12 max-w-3xl">
          <h2 id="post-faq" className="mb-4 text-2xl font-semibold">FAQ</h2>
          <Accordion items={post.faqs.map((faq, index) => ({ id: String(index), title: faq.question, content: <p className="text-ink-soft">{faq.answer}</p> }))} />
        </section>
      ) : null}

      {products && products.items.length > 0 && (
        <section aria-labelledby="mentioned" className="mt-14">
          <h2 id="mentioned" className="mb-5 text-2xl font-semibold">Products mentioned</h2>
          <ProductGrid products={products.items} />
        </section>
      )}

      <section aria-labelledby="related-posts" className="mt-14">
        <h2 id="related-posts" className="mb-5 text-2xl font-semibold">Related articles</h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <li key={item.id}><BlogCard post={item} /></li>)}</ul>
      </section>
    </article>
  );
}
