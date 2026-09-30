import { demoBlogPosts } from "@/data/demo/blog";
import { demoCategories } from "@/data/demo/categories";
import { demoCoupons } from "@/data/demo/coupons";
import { demoProducts } from "@/data/demo/products";
import { demoReviews } from "@/data/demo/reviews";
import { calculateShipping, evaluateCoupon } from "@/lib/pricing";
import type { Order } from "@/types";
import { runProductQuery } from "./query";
import { RepositoryError, type Repository } from "./types";

const activeCategories = () => demoCategories.filter((category) => category.status === "active").sort((a, b) => a.sortOrder - b.sortOrder);

/** Development adapter. Nothing here is persisted. */
export const demoRepository: Repository = {
  async listCategories() {
    return activeCategories();
  },
  async getCategory(slug) {
    return activeCategories().find((category) => category.slug === slug) ?? null;
  },
  async listProducts(query) {
    return runProductQuery(demoProducts, activeCategories(), query);
  },
  async getProduct(slug) {
    return demoProducts.find((product) => product.slug === slug && product.status === "active") ?? null;
  },
  async getProductsByIds(ids) {
    return demoProducts.filter((product) => ids.includes(product.id));
  },
  async listReviews(productId) {
    return productId ? demoReviews.filter((review) => review.productId === productId || review.productId === null) : demoReviews;
  },
  async listBlogPosts({ category, q, limit } = {}) {
    let posts = [...demoBlogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    if (category) posts = posts.filter((post) => post.category === category);
    if (q) {
      const needle = q.toLowerCase();
      posts = posts.filter((post) => `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(needle));
    }
    return limit ? posts.slice(0, limit) : posts;
  },
  async getBlogPost(slug) {
    return demoBlogPosts.find((post) => post.slug === slug) ?? null;
  },
  async getCoupon(code) {
    return demoCoupons.find((coupon) => coupon.code === code.toUpperCase()) ?? null;
  },
  async createOrder(request) {
    // Prices, names and stock always come from the catalogue — never from the client.
    const products = await this.getProductsByIds(request.items.map((item) => item.productId));
    const items = request.items.map((line) => {
      const product = products.find((candidate) => candidate.id === line.productId);
      const variant = product?.variants.find((candidate) => candidate.id === line.variantId);
      if (!product || !variant) throw new RepositoryError("INVALID", "One of the items in your cart is no longer available.");
      if (variant.stock < line.quantity)
        throw new RepositoryError("OUT_OF_STOCK", `Only ${variant.stock} left of ${product.name} (${variant.label}).`, 409);
      return {
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        slug: product.slug,
        variantLabel: variant.label,
        sku: variant.sku,
        unitPrice: variant.price,
        quantity: line.quantity,
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const coupon = request.couponCode ? await this.getCoupon(request.couponCode) : null;
    const check = request.couponCode ? evaluateCoupon(coupon ?? undefined, subtotal) : null;
    if (check && !check.valid) throw new RepositoryError("INVALID", check.message);
    const discount = check?.discount ?? 0;
    const shipping = calculateShipping(subtotal - discount);
    const now = new Date().toISOString();
    const order: Order = {
      id: `DEMO-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 36 ** 3).toString(36).toUpperCase()}`,
      customer: { name: request.address.fullName, email: request.address.email, mobile: request.address.mobile },
      items,
      subtotal,
      shipping,
      discount,
      couponCode: check?.valid ? request.couponCode : undefined,
      total: subtotal - discount + shipping,
      paymentMethod: request.paymentMethod,
      paymentStatus: request.paymentMethod === "cod" ? "cod" : "pending",
      orderStatus: "placed",
      shippingAddress: request.address,
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    };
    return order;
  },
  async getOrder() {
    // Demo orders live only in the shopper's browser (see order store).
    return null;
  },
};

