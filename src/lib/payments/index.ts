import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Payment provider adapter. Card/UPI/net-banking data is entered on the
 * provider's hosted checkout — it never reaches this server.
 * Razorpay is implemented as the example; add other providers behind the same interface.
 * NOTE: not exercised against live credentials in this repo — test in the
 * provider's sandbox before going live.
 */
export interface ProviderOrder {
  provider: "razorpay";
  providerOrderId: string;
  amountInPaise: number;
  currency: string;
  /** Public key id (safe for the browser). The secret never leaves the server. */
  keyId: string;
}

export interface PaymentProvider {
  createOrder(input: { receipt: string; amountInRupees: number }): Promise<ProviderOrder>;
  verifySignature(input: { providerOrderId: string; paymentId: string; signature: string }): boolean;
}

function razorpay(): PaymentProvider {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) throw new Error("Razorpay keys are not configured");
  return {
    async createOrder({ receipt, amountInRupees }) {
      const amountInPaise = Math.round(amountInRupees * 100);
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString("base64")}` },
        body: JSON.stringify({ amount: amountInPaise, currency: "INR", receipt }),
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Razorpay order creation failed (${response.status})`);
      const data = (await response.json()) as { id: string };
      return { provider: "razorpay", providerOrderId: data.id, amountInPaise, currency: "INR", keyId };
    },
    verifySignature({ providerOrderId, paymentId, signature }) {
      const expected = createHmac("sha256", secret).update(`${providerOrderId}|${paymentId}`).digest("hex");
      const a = Buffer.from(expected);
      const b = Buffer.from(signature);
      return a.length === b.length && timingSafeEqual(a, b);
    },
  };
}

/** null => no provider configured (online payment methods are then unavailable). */
export function getPaymentProvider(): PaymentProvider | null {
  if (process.env.PAYMENT_PROVIDER === "razorpay" && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) return razorpay();
  return null;
}
