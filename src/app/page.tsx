import type { Metadata } from "next";
import { BlogCard } from "@/components/blog/BlogCard";
import { CategoryGrid } from "@/components/home/CategoryCard";
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { FeaturedContent } from "@/components/home/FeaturedContent";
import { HeroBanner } from "@/components/home/HeroBanner";
import { Newsletter } from "@/components/home/Newsletter";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductSection } from "@/components/home/ProductSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { site } from "@/config/site";
import { repo } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  path: "/",
});

// Home sections are driven by data, so the admin panel can later reorder or hide them.
const categorySections = [
  { slug: "fruit-powder", id: "fruit", title: "Fruit Powder", link: "View All Fruit Powder", description: "Fruit powders for smoothies, baking and desserts." },
  { slug: "leaf-powder", id: "leaf", title: "Leaf Powder", link: "View All Leaf Powder", description: "Leaf powders for teas, chutneys and cooking.", tinted: true },
  { slug: "vegetable-powder", id: "veg", title: "Vegetable Powder", link: "View All Vegetable Powder", description: "Vegetable powders to add colour and flavour." },
] as const;

export default async function HomePage() {
  const [categories, best, combos, posts, reviews, ...sections] = await Promise.all([
    repo.listCategories(),
    repo.listProducts({ bestSeller: true, sort: "popular", pageSize: 4 }),
    repo.listProducts({ category: "combos", sort: "popular", pageSize: 4 }),
    repo.listBlogPosts({ limit: 3 }),
    repo.listReviews(),
    ...categorySections.map((section) => repo.listProducts({ category: section.slug, sort: "popular", pageSize: 4 })),
  ]);

  return (
    <>
      <HeroBanner />

      <section aria-labelledby="shop-by-category" className="section">
        <div className="container-page">
          <SectionHeading id="shop-by-category" eyebrow="Browse" title="Shop by Category" href="/categories" linkLabel="All categories" />
          <CategoryGrid categories={categories} />
        </div>
      </section>

      <ProductSection id="best-sellers" title="Best Sellers" description="Our most popular products right now." products={best.items} href="/shop?sort=popular" linkLabel="View all" tinted />

      {categorySections.map((section, index) => (
        <ProductSection key={section.slug} id={section.id} title={section.title} description={section.description} products={sections[index].items} href={`/category/${section.slug}`} linkLabel={section.link} tinted={"tinted" in section} />
      ))}

      {combos.items.length > 0 && (
        <section aria-labelledby="combos" className="section bg-sand-50">
          <div className="container-page">
            <SectionHeading id="combos" eyebrow="Value packs" title="Save More With Combos" description="Hand-picked bundles priced lower than buying each item separately." href="/category/combos" linkLabel="View All Combos" />
            <ProductGrid products={combos.items} />
          </div>
        </section>
      )}

      <WhyChooseUs />
      <FeaturedContent />
      <CustomerReviews reviews={reviews} />

      <section aria-labelledby="blog" className="section">
        <div className="container-page">
          <SectionHeading id="blog" eyebrow="From the blog" title="Latest articles" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => <li key={post.id}><BlogCard post={post} /></li>)}
          </ul>
          <div className="mt-8 text-center"><Button href="/blog" variant="outline">View All Articles</Button></div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}

