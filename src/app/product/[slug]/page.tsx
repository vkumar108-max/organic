import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ReviewCard } from "@/components/product/ReviewCard";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { JsonLd } from "@/components/ui/JsonLd";
import { Rating } from "@/components/ui/Rating";
import { repo } from "@/lib/data";
import { buildMetadata, faqSchema, productSchema } from "@/lib/seo";
import { toneFor } from "@/lib/tone";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { items } = await repo.listProducts({ pageSize: 200 });
  return items.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await repo.getProduct((await params).slug);
  if (!product) return { title: "Product not found", robots: { index: false } };
  return buildMetadata({ title: product.name, description: product.shortDescription, path: `/product/${product.slug}` });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await repo.getProduct(slug);
  if (!product) notFound();

  const [category, reviews, related] = await Promise.all([
    repo.getCategory(product.category),
    repo.listReviews(product.id),
    repo.listProducts({ category: product.category, sort: "popular", pageSize: 5 }),
  ]);
  const relatedProducts = related.items.filter((candidate) => candidate.id !== product.id).slice(0, 4);
  const faqs = product.faqs ?? category?.faqs ?? [];

  return (
    <div className="container-page pb-10">
      <JsonLd data={productSchema(product)} />
      {faqs.length > 0 && <JsonLd data={faqSchema(faqs)} />}
      <Breadcrumb
        items={[
          ...(category ? [{ name: category.name, href: `/category/${category.slug}` }] : []),
          { name: product.name, href: `/product/${product.slug}` },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} tone={toneFor(product)} productName={product.name} />
        <div className="space-y-5">
          {category && <Link href={`/category/${category.slug}`} className="text-sm font-bold uppercase tracking-wider text-clay-500 hover:underline">{category.name}</Link>}
          <h1 className="text-3xl font-semibold sm:text-4xl">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Rating value={product.rating} size={18} showValue />
            <a href="#reviews" className="text-sm text-ink-soft underline">{product.reviewCount} reviews</a>
            <span className="text-sm text-ink-soft">SKU: {product.sku}</span>
          </div>
          <p className="text-ink-soft">{product.shortDescription}</p>
          <ProductPurchase product={product} />
        </div>
      </div>

      <div className="mt-14 max-w-4xl">
        <ProductDetails product={product} />
      </div>

      <section id="reviews" aria-labelledby="reviews-title" className="mt-14 scroll-mt-40">
        <h2 id="reviews-title" className="mb-2 text-2xl font-semibold">Customer reviews</h2>
        <p className="mb-5 text-sm text-ink-soft">Rating shown is demo data. Verified-purchase reviews will appear here once the backend is connected.</p>
        {reviews.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-3">{reviews.map((review) => <li key={review.id}><ReviewCard review={review} /></li>)}</ul>
        ) : (
          <p className="rounded-card border border-dashed border-line p-6 text-center text-ink-soft">No reviews yet. Be the first to review this product after your purchase.</p>
        )}
      </section>

      {faqs.length > 0 && (
        <section aria-labelledby="faq-title" className="mt-14 max-w-3xl">
          <h2 id="faq-title" className="mb-4 text-2xl font-semibold">Frequently asked questions</h2>
          <Accordion items={faqs.map((faq, index) => ({ id: String(index), title: faq.question, content: <p className="text-ink-soft">{faq.answer}</p> }))} />
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section aria-labelledby="related-title" className="mt-14">
          <h2 id="related-title" className="mb-5 text-2xl font-semibold">You may also like</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
