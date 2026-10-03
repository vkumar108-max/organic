import { NextResponse } from "next/server";
import { handleError } from "@/lib/api";
import { repo } from "@/lib/data";
import { searchCategories } from "@/lib/search";

/** GET /api/search/suggest?q=app → top products + matching categories (small payload). */
export async function GET(request: Request) {
  try {
    const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 60);
    if (q.length < 2) return NextResponse.json({ products: [], categories: [] });
    const [categories, result] = await Promise.all([repo.listCategories(), repo.listProducts({ q, pageSize: 6 })]);
    const names = new Map(categories.map((category) => [category.slug, category.name]));
    return NextResponse.json({
      products: result.items.map((product) => ({ name: product.name, slug: product.slug, category: names.get(product.category) ?? product.category, price: product.price })),
      categories: searchCategories(categories, q).map((category) => ({ name: category.name, slug: category.slug })),
    });
  } catch (error) {
    return handleError(error);
  }
}
