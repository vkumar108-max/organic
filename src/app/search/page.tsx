import type { Metadata } from "next";
import Link from "next/link";
import { CatalogView } from "@/components/catalog/CatalogView";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { parseCatalogParams, type SearchParams } from "@/lib/catalog-params";
import { repo } from "@/lib/data";
import { searchCategories } from "@/lib/search";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = parseCatalogParams(params);
  const [categories, result] = await Promise.all([repo.listCategories(), repo.listProducts(query)]);
  const matchedCategories = query.q ? searchCategories(categories, query.q) : [];

  return (
    <div className="container-page pb-10">
      <Breadcrumb items={[{ name: "Search", href: "/search" }]} />
      <h1 className="mb-2 text-3xl font-semibold">{query.q ? <>Results for “{query.q}”</> : "Search products"}</h1>
      {matchedCategories.length > 0 && (
        <p className="mb-6 text-sm text-ink-soft">
          Categories:{" "}
          {matchedCategories.map((category) => <Link key={category.id} href={`/category/${category.slug}`} className="mr-2 font-semibold text-brand-700 underline">{category.name}</Link>)}
        </p>
      )}
      {!query.q ? (
        <EmptyState icon="search" title="What are you looking for?" description="Type a product, category or keyword in the search bar above." action={{ label: "Browse all products", href: "/shop" }} />
      ) : result.total === 0 && !query.minPrice && !query.maxPrice && !query.type && !query.size && !query.minRating && !query.inStock ? (
        <EmptyState icon="search" title={`No results for “${query.q}”`} description="Check the spelling, try a more general word (for example “mango” or “leaf”), or browse our categories." action={{ label: "Browse categories", href: "/categories" }} secondary={{ label: "Shop all", href: "/shop" }} />
      ) : (
        <CatalogView result={result} basePath="/search" searchParams={params} categories={categories} sort={query.sort} />
      )}
    </div>
  );
}
