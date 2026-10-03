import type { Address, Order } from "@/types";

interface RazorpayPayment { keyId: string; providerOrderId: string; amountInPaise: number; currency: string }

interface RazorpayInstance { open: () => void; on: (event: string, handler: () => void) => void }
declare global {
  interface Window { Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance }
}

const SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load the secure payment window. Check your connection."));
    document.body.appendChild(script);
  });
}

/**
 * Opens the provider's hosted checkout. Resolves "paid" after the signature is
 * verified by our server, or "failed" if the shopper closes it / payment fails.
 * Card, UPI and bank details are typed into Razorpay's window, never into our page.
 */
export async function payWithRazorpay(payment: RazorpayPayment, order: Order, address: Address, brand: string): Promise<"paid" | "failed"> {
  await loadScript();
  return new Promise((resolve) => {
    const checkout = new window.Razorpay!({
      key: payment.keyId,
      amount: payment.amountInPaise,
      currency: payment.currency,
      name: brand,
      order_id: payment.providerOrderId,
      prefill: { name: address.fullName, email: address.email, contact: address.mobile },
      handler: async (response: { razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ providerOrderId: payment.providerOrderId, paymentId: response.razorpay_payment_id, signature: response.razorpay_signature }),
          });
          const data = await verify.json();
          resolve(verify.ok && data.verified ? "paid" : "failed");
        } catch {
          resolve("failed");
        }
      },
      modal: { ondismiss: () => resolve("failed") },
      notes: { order_id: order.id },
    });
    checkout.on("payment.failed", () => resolve("failed"));
    checkout.open();
  });
}
