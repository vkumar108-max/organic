import type { PaymentMethod } from "@/types";

/**
 * Central, editable site configuration. Everything a business owner might want
 * to change (brand, announcement text, shipping rules) lives here or comes from
 * environment variables — nothing is hard-coded inside components.
 */

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const site = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Verdant Roots",
  tagline: "Natural goodness, made simple",
  description:
    "Fruit, leaf and vegetable powders, tablets, dry vegetables and value combos for everyday cooking and living.",
  url: siteUrl,
  locale: "en_IN",
  currency: "INR",
  currencySymbol: "₹",
  /** Demo catalogue must not be indexed by search engines */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
  dataMode: (process.env.NEXT_PUBLIC_DATA_MODE === "live" ? "live" : "demo") as "demo" | "live",
  contact: {
    // Placeholders — replace with confirmed business details.
    email: "hello@example.com",
    phone: "+91 00000 00000",
    address: "Your registered business address goes here",
    hours: "Mon–Sat, 10:00 AM – 6:00 PM IST",
  },
  social: [
    { label: "Instagram", href: "https://instagram.com/", icon: "instagram" },
    { label: "Facebook", href: "https://facebook.com/", icon: "facebook" },
    { label: "YouTube", href: "https://youtube.com/", icon: "youtube" },
    { label: "X", href: "https://x.com/", icon: "x" },
  ] as const,
} as const;

/** Announcement bar messages. Only add claims you have confirmed. */
export const announcements: string[] = [
  "🚚 Free shipping on orders above ₹499",
  "🌿 Natural products, carefully packed",
  "🔒 Secure checkout",
  "📦 Delivery across India",
];

export const shippingRules = {
  freeShippingThreshold: 499,
  flatRate: 49,
  estimatedDelivery: "Estimated 4–7 business days (to be confirmed by the business)",
} as const;

export const pagination = { shopPageSize: 12 } as const;

export interface PaymentOption {
  id: PaymentMethod;
  label: string;
  description: string;
  enabled: boolean;
}

/**
 * Only enable a method that your payment provider account really supports.
 * Online methods are completed on the provider's hosted page; card details
 * never touch this site.
 */
export const paymentOptions: PaymentOption[] = [
  { id: "upi", label: "UPI", description: "Pay with any UPI app on the secure payment page.", enabled: true },
  { id: "card", label: "Credit / Debit Card", description: "Entered on the payment provider's secure page.", enabled: true },
  { id: "netbanking", label: "Net Banking", description: "Choose your bank on the secure payment page.", enabled: true },
  { id: "cod", label: "Cash on Delivery", description: "Pay when your order arrives.", enabled: true },
];

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop", mega: true },
  { label: "Categories", href: "/categories" },
  { label: "Combos", href: "/category/combos" },
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
] as const;

export const footerLinks = {
  quick: [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact Us", href: "/contact" },
  ],
  support: [
    { label: "My Account", href: "/account" },
    { label: "Track Order", href: "/track-order" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "/contact" },
  ],
  policies: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
} as const;
