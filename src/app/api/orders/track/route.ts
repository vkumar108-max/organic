import { NextResponse } from "next/server";
import { site } from "@/config/site";
import { handleError, jsonError, parseBody, rateLimited } from "@/lib/api";
import { repo } from "@/lib/data";
import { trackSchema } from "@/lib/validation";

/** POST { orderId, contact } → order (live mode). Demo orders are looked up in the browser. */
export async function POST(request: Request) {
  if (rateLimited(request, "track", 15)) return jsonError("RATE_LIMITED", "Too many attempts. Please wait a minute.", 429);
  const parsed = await parseBody(request, trackSchema);
  if ("response" in parsed) return parsed.response;
  if (site.dataMode !== "live") return jsonError("NOT_CONFIGURED", "Order tracking needs the store backend, which is not connected in demo mode.", 501);
  try {
    const order = await repo.getOrder(parsed.data.orderId, parsed.data.contact);
    if (!order) return jsonError("NOT_FOUND", "We couldn’t find an order with those details.", 404);
    return NextResponse.json(order);
  } catch (error) {
    return handleError(error);
  }
}
