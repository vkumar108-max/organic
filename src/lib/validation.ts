import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.email("Enter a valid email address").max(120),
  line1: z.string().trim().min(5, "Enter your address").max(160),
  line2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(2, "Enter your city").max(60),
  state: z.string().trim().min(2, "Select your state").max(60),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code"),
});

export const orderRequestSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), variantId: z.string().min(1), quantity: z.number().int().min(1).max(20) }))
    .min(1, "Your cart is empty")
    .max(50),
  address: addressSchema,
  paymentMethod: z.enum(["upi", "card", "netbanking", "cod"]),
  couponCode: z.string().trim().toUpperCase().max(30).optional(),
});
export type OrderRequest = z.infer<typeof orderRequestSchema>;

export const couponRequestSchema = z.object({
  code: z.string().trim().toUpperCase().min(2).max(30),
  subtotal: z.number().min(0).max(1_000_000),
});

export const newsletterSchema = z.object({ email: z.email("Enter a valid email address").max(120) });

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.email("Enter a valid email address").max(120),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(2000),
});

export const trackSchema = z.object({
  orderId: z.string().trim().min(4, "Enter your order number").max(40),
  contact: z.string().trim().min(5, "Enter the email or mobile used at checkout").max(120),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

/** Turn a zod error into { field: message } for forms and API responses. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
