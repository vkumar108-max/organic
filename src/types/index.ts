/**
 * Domain model shared by the website, the API routes and (later) the mobile
 * app + admin panel. Keep this file free of UI concerns.
 */

export type PublishStatus = "active" | "draft" | "archived";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface MenuLink {
  label: string;
  /** Query string appended to /category/[slug], e.g. "sort=newest" */
  query?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  /** null => a generated illustration is shown until a real image is uploaded */
  image: string | null;
  status: PublishStatus;
  sortOrder: number;
  /** Mega-menu links; defaults to All / Popular / New arrivals when omitted */
  menuLinks?: MenuLink[];
  faqs?: FaqItem[];
  /** Visual tone for generated artwork (maps to design tokens) */
  tone: ProductTone;
}

export type ProductTone = "fruit" | "leaf" | "vegetable" | "combo" | "tablet" | "dry";

export interface ProductImage {
  /** null => generated placeholder artwork is rendered */
  src: string | null;
  alt: string;
}

export interface ProductVariant {
  id: string;
  /** e.g. "250 g" */
  label: string;
  price: number;
  mrp: number;
  stock: number;
  sku: string;
}

export interface NutritionRow {
  nutrient: string;
  perServing: string;
}

export type ProductType = "powder" | "tablet" | "dry" | "combo";

export interface Product {
  id: string;
  name: string;
  slug: string;
  /** Category slug */
  category: string;
  subcategory?: string;
  productType: ProductType;
  description: string;
  shortDescription: string;
  highlights: string[];
  images: ProductImage[];
  /** Price of the default (first) variant, denormalised for listing/sorting */
  price: number;
  mrp: number;
  /** Whole-number percentage */
  discount: number;
  variants: ProductVariant[];
  stock: number;
  sku: string;
  /** null => "to be provided by the business" placeholder is shown */
  ingredients: string | null;
  usage: string | null;
  storage: string | null;
  nutrition: NutritionRow[] | null;
  keywords: string[];
  rating: number;
  reviewCount: number;
  /** Sales/popularity score used for the "Popular" sort */
  popularity: number;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  status: PublishStatus;
  faqs?: FaqItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string | null;
  author: string;
  rating: number;
  title?: string;
  body: string;
  verifiedPurchase: boolean;
  createdAt: string;
  /** Sample content must be clearly labelled in the UI */
  isSample: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  readingMinutes: number;
  image: string | null;
  tone: ProductTone;
  featured: boolean;
  popularity: number;
  /** Simple structured content so the CMS can replace it later */
  body: BlogBlock[];
  faqs?: FaqItem[];
  relatedProductSlugs?: string[];
}

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] };

/* ---------------------------------------------------------------- Coupons */

export type DiscountType = "percentage" | "fixed";

export interface Coupon {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrder: number;
  /** Only meaningful for percentage coupons */
  maxDiscount: number | null;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
}

/* ------------------------------------------------------------------ Orders */

export const ORDER_STATUSES = [
  "placed",
  "payment_confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number] | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "cod";

export type PaymentMethod = "upi" | "card" | "netbanking" | "cod";

export interface Address {
  fullName: string;
  mobile: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  variantLabel: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer: { name: string; email: string; mobile: string };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: Address;
  /** true when created by the demo adapter (never persisted server side) */
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------- Catalogue IO */

export type ProductSort = "popular" | "newest" | "price-asc" | "price-desc" | "rating";

export interface ProductQuery {
  category?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
  type?: ProductType;
  size?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  /** Restrict to these slugs (used by wishlist / cart) */
  slugs?: string[];
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** Options available for the sidebar, computed from the *unfiltered* set */
  facets: { sizes: string[]; types: ProductType[] };
}

export interface ApiError {
  error: { code: string; message: string; fields?: Record<string, string> };
}
