import type { BlogPost, Category, Coupon, Order, Product, ProductListResult, ProductQuery, Review } from "@/types";
import type { OrderRequest } from "@/lib/validation";

/**
 * The single data contract used by pages and API routes.
 * - demoRepository  : bundled sample data (development only)
 * - httpRepository  : the shared backend/API used by website AND mobile app
 * Pages never import demo data directly, so swapping is a one-line change.
 */
export interface Repository {
  listCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | null>;
  listProducts(query?: ProductQuery): Promise<ProductListResult>;
  getProduct(slug: string): Promise<Product | null>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  listReviews(productId?: string): Promise<Review[]>;
  listBlogPosts(options?: { category?: string; q?: string; limit?: number }): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | null>;
  getCoupon(code: string): Promise<Coupon | null>;
  createOrder(request: OrderRequest): Promise<Order>;
  getOrder(orderId: string, contact: string): Promise<Order | null>;
}

export class RepositoryError extends Error {
  constructor(
    public code: "NOT_CONFIGURED" | "OUT_OF_STOCK" | "INVALID" | "UPSTREAM",
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
