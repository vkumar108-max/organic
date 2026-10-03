import { NextResponse } from "next/server";
import { handleError } from "@/lib/api";
import { repo } from "@/lib/data";

export async function GET() {
  try {
    return NextResponse.json(await repo.listCategories(), { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch (error) {
    return handleError(error);
  }
}
