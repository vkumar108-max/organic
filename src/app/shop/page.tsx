import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { parseCatalogParams, type SearchParams } from "@/lib/catalog-params";
import { repo } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Shop All Products",
  description: "Browse fruit, leaf and vegetable powders, tablets, dry vegetables and combos. Filter by price, rating and pack size.",
  path: "/shop",
});

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = parseCatalogParams(params);
  const [categories, result] = await Promise.all([repo.listCategories(), repo.listProducts(query)]);
  return (
    <div className="container-page pb-10">
      <Breadcrumb items={[{ name: "Shop", href: "/shop" }]} />
      <h1 className="mb-6 text-3xl font-semibold sm:text-4xl">Shop All Products</h1>
      <CatalogView result={result} basePath="/shop" searchParams={params} categories={categories} sort={query.sort} />
    </div>
  );
}
