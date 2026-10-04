import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseBody } from "@/lib/api";
import { getPaymentProvider } from "@/lib/payments";

const schema = z.object({ providerOrderId: z.string().min(1), paymentId: z.string().min(1), signature: z.string().min(1) });

/**
 * Confirms the provider's signature so the UI can show success. The order's
 * paymentStatus must be finalised by the provider WEBHOOK on the backend — the
 * browser callback alone is never trusted as proof of payment.
 */
export async function POST(request: Request) {
  const provider = getPaymentProvider();
  if (!provider) return jsonError("PAYMENT_NOT_CONFIGURED", "Payments are not configured.", 503);
  const parsed = await parseBody(request, schema);
  if ("response" in parsed) return parsed.response;
  return NextResponse.json({ verified: provider.verifySignature(parsed.data) });
}
