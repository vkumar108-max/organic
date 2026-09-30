import type { Metadata } from "next";
import { CategoryGrid } from "@/components/home/CategoryCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { repo } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "All Categories",
  description: "Explore every product category: fruit powder, leaf powder, vegetable powder, combos, tablets and dry vegetables.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const categories = await repo.listCategories();
  return (
    <div className="container-page pb-10">
      <Breadcrumb items={[{ name: "Categories", href: "/categories" }]} />
      <h1 className="mb-2 text-3xl font-semibold sm:text-4xl">Shop by Category</h1>
      <p className="mb-8 max-w-2xl text-ink-soft">Pick a category to see every product, pack size and price.</p>
      <CategoryGrid categories={categories} />
    </div>
  );
}
