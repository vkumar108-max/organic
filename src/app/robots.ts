import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { absoluteUrl } from "@/lib/format";

export default function robots(): MetadataRoute.Robots {
  if (!site.allowIndexing) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/cart", "/checkout", "/account", "/search"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
