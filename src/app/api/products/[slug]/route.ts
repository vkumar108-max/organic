import { NextResponse } from "next/server";
import { handleError, jsonError } from "@/lib/api";
import { repo } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await repo.getProduct(slug);
    if (!product) return jsonError("NOT_FOUND", "Product not found.", 404);
    return NextResponse.json(product, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    return handleError(error);
  }
}
