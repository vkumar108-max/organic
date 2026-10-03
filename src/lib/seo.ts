import type { Metadata } from "next";
import { site } from "@/config/site";
import { absoluteUrl } from "@/lib/format";
import type { BlogPost, Category, Product } from "@/types";

interface MetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
}

/** One place that builds title/description/canonical/OG/Twitter metadata. */
export function buildMetadata({ title, description, path, image, type = "website", noindex }: MetaInput): Metadata {
  const url = absoluteUrl(path);
  const images = [{ url: absoluteUrl(image ?? "/opengraph-image"), width: 1200, height: 630, alt: title }];
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex || !site.allowIndexing ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: { title, description, url, siteName: site.name, locale: site.locale, type, images },
    twitter: { card: "summary_large_image", title, description, images: images.map((image) => image.url) },
  };
}

export type Crumb = { name: string; href: string };

export const breadcrumbSchema = (crumbs: Crumb[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.href),
  })),
});

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: absoluteUrl("/icon.svg"),
  sameAs: site.social.map((link) => link.href),
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: site.url,
  potentialAction: {
    "@type": "SearchAction",
    target: `${site.url}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

/**
 * Product schema contains only fields that exist in the catalogue. Ratings are
 * omitted while the site runs on demo data so sample numbers never reach Google.
 */
export function productSchema(product: Product) {
  const live = site.dataMode === "live";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.sku,
    category: product.category,
    url: absoluteUrl(`/product/${product.slug}`),
    ...(live && product.reviewCount > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount } }
      : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: site.currency,
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/product/${product.slug}`),
    },
  };
}

export const categorySchema = (category: Category, products: Product[]) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: category.name,
  description: category.description,
  url: absoluteUrl(`/category/${category.slug}`),
  mainEntity: {
    "@type": "ItemList",
    itemListElement: products.slice(0, 20).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/product/${product.slug}`),
      name: product.name,
    })),
  },
});

export const articleSchema = (post: BlogPost) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.excerpt,
  datePublished: post.publishedAt,
  author: { "@type": "Person", name: post.author },
  publisher: { "@type": "Organization", name: site.name },
  mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
});

export const faqSchema = (items: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
});
