import "server-only";
import type { BlogPost, Category, Coupon, Order, Product, ProductListResult, ProductQuery, Review } from "@/types";
import { RepositoryError, type Repository } from "./types";

/**
 * Adapter for the shared backend (REST). The mobile app talks to the very same
 * endpoints — see docs/API_CONTRACT.md. Secrets stay on the server.
 */
function baseUrl() {
  const url = process.env.BACKEND_API_URL;
  if (!url) throw new RepositoryError("NOT_CONFIGURED", "BACKEND_API_URL is not set.", 503);
  return url.replace(/\/$/, "");
}

async function request<T>(path: string, init?: RequestInit & { revalidate?: number }): Promise<T | null> {
  const { revalidate = 60, ...rest } = init ?? {};
  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(process.env.BACKEND_API_KEY ? { Authorization: `Bearer ${process.env.BACKEND_API_KEY}` } : {}),
        ...rest.headers,
      },
      next: { revalidate },
    });
  } catch {
    throw new RepositoryError("UPSTREAM", "Could not reach the store backend.", 502);
  }
  if (response.status === 404) return null;
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new RepositoryError("UPSTREAM", body?.error?.message ?? "Backend request failed.", response.status);
  }
  return (await response.json()) as T;
}

const toQueryString = (query: Record<string, unknown>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === false || value === "") continue;
    params.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
};

const required = <T>(value: T | null, what: string): T => {
  if (value === null) throw new RepositoryError("UPSTREAM", `Backend returned no ${what}.`, 502);
  return value;
};

export const httpRepository: Repository = {
  async listCategories() {
    return required(await request<Category[]>("/categories"), "categories");
  },
  getCategory: (slug) => request<Category>(`/categories/${encodeURIComponent(slug)}`),
  async listProducts(query: ProductQuery = {}) {
    return required(await request<ProductListResult>(`/products${toQueryString({ ...query })}`), "products");
  },
  getProduct: (slug) => request<Product>(`/products/${encodeURIComponent(slug)}`),
  async getProductsByIds(ids) {
    return required(await request<Product[]>(`/products${toQueryString({ ids })}`, { revalidate: 0 }), "products");
  },
  async listReviews(productId) {
    return required(await request<Review[]>(`/reviews${toQueryString({ productId })}`), "reviews");
  },
  async listBlogPosts(options = {}) {
    return required(await request<BlogPost[]>(`/blog${toQueryString(options)}`), "posts");
  },
  getBlogPost: (slug) => request<BlogPost>(`/blog/${encodeURIComponent(slug)}`),
  getCoupon: (code) => request<Coupon>(`/coupons/${encodeURIComponent(code)}`, { revalidate: 0 }),
  async createOrder(order) {
    return required(await request<Order>("/orders", { method: "POST", body: JSON.stringify(order), revalidate: 0 }), "order");
  },
  getOrder: (orderId, contact) =>
    request<Order>(`/orders/${encodeURIComponent(orderId)}${toQueryString({ contact })}`, { revalidate: 0 }),
};
