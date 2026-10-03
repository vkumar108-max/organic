import { NextResponse } from "next/server";
import { handleError, parseBody, rateLimited, jsonError } from "@/lib/api";
import { repo } from "@/lib/data";
import { evaluateCoupon } from "@/lib/pricing";
import { couponRequestSchema } from "@/lib/validation";

/** POST { code, subtotal } → { valid, discount, message }. Authoritative check happens again when the order is created. */
export async function POST(request: Request) {
  if (rateLimited(request, "coupon", 15)) return jsonError("RATE_LIMITED", "Too many attempts. Please wait a minute.", 429);
  const parsed = await parseBody(request, couponRequestSchema);
  if ("response" in parsed) return parsed.response;
  try {
    const coupon = await repo.getCoupon(parsed.data.code);
    const result = evaluateCoupon(coupon ?? undefined, parsed.data.subtotal);
    return NextResponse.json({ ...result, code: parsed.data.code });
  } catch (error) {
    return handleError(error);
  }
}
