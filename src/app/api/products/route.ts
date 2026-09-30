import { NextResponse } from "next/server";
import { handleError } from "@/lib/api";
import { parseCatalogParams } from "@/lib/catalog-params";
import { repo } from "@/lib/data";

/** GET /api/products?category=&q=&minPrice=&maxPrice=&inStock=1&rating=&type=&size=&sort=&page= */
export async function GET(request: Request) {
  try {
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const query = parseCatalogParams(params);
    // Wishlist / cart hydration: /api/products?slugs=a,b,c
    const slugs = params.slugs?.split(",").map((slug) => slug.trim()).filter(Boolean).slice(0, 50);
    const pageSize = Math.min(Number(params.pageSize) || 12, 100);
    return NextResponse.json(await repo.listProducts({ ...query, slugs, pageSize }), { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    return handleError(error);
  }
}
