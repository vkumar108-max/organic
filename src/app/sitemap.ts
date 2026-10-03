import type { MetadataRoute } from "next";
import { repo } from "@/lib/data";
import { absoluteUrl } from "@/lib/format";

const staticPaths = ["/", "/shop", "/categories", "/blog", "/about", "/contact", "/faq", "/track-order", "/privacy-policy", "/terms-and-conditions", "/refund-policy", "/shipping-policy", "/disclaimer"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, posts] = await Promise.all([repo.listCategories(), repo.listProducts({ pageSize: 1000 }), repo.listBlogPosts()]);
  return [
    ...staticPaths.map((path) => ({ url: absoluteUrl(path), changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.6 })),
    ...categories.map((category) => ({ url: absoluteUrl(`/category/${category.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.items.map((product) => ({ url: absoluteUrl(`/product/${product.slug}`), lastModified: product.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...posts.map((post) => ({ url: absoluteUrl(`/blog/${post.slug}`), lastModified: post.publishedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
