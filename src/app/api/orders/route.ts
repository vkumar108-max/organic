import { NextResponse } from "next/server";
import { site } from "@/config/site";
import { handleError, jsonError, parseBody, rateLimited } from "@/lib/api";
import { repo } from "@/lib/data";
import { getPaymentProvider } from "@/lib/payments";
import { orderRequestSchema } from "@/lib/validation";

/**
 * POST /api/orders — the client sends only ids + quantities + address.
 * Prices, stock and coupons are re-checked server side by the repository.
 * Online payment methods need a configured provider; COD does not.
 */
export async function POST(request: Request) {
  if (rateLimited(request, "orders", 10)) return jsonError("RATE_LIMITED", "Too many attempts. Please wait a minute.", 429);
  const parsed = await parseBody(request, orderRequestSchema);
  if ("response" in parsed) return parsed.response;

  const provider = parsed.data.paymentMethod === "cod" ? null : getPaymentProvider();
  if (parsed.data.paymentMethod !== "cod" && !provider) {
    return jsonError("PAYMENT_NOT_CONFIGURED", "Online payments are not available yet. Please choose Cash on Delivery or try again later.", 503);
  }

  try {
    const order = await repo.createOrder(parsed.data);
    const payment = provider ? await provider.createOrder({ receipt: order.id, amountInRupees: order.total }) : null;
    return NextResponse.json({ order, payment, persisted: site.dataMode === "live" }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
