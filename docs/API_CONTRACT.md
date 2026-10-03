# Shared API contract (website + mobile app + admin)

The website talks to data only through `Repository` (`src/lib/data/types.ts`).
`NEXT_PUBLIC_DATA_MODE=demo` uses bundled sample data; `live` uses `httpRepository`,
which calls the backend below. The mobile app and admin panel use the same backend/database.

    ADMIN PANEL -> BACKEND/API -> DATABASE <- WEBSITE / MOBILE APP

Backend endpoints expected by `src/lib/data/http.ts` (JSON, types in `src/types/index.ts`):

| Method | Path | Returns |
|---|---|---|
| GET | /categories, /categories/:slug | Category[] / Category |
| GET | /products?category&q&minPrice&maxPrice&inStock&minRating&type&size&sort&page&pageSize&ids | ProductListResult |
| GET | /products/:slug | Product |
| GET | /reviews?productId | Review[] |
| GET | /blog?category&q&limit, /blog/:slug | BlogPost[] / BlogPost |
| GET | /coupons/:code | Coupon |
| POST | /orders | Order (re-validates prices, stock, coupon) |
| GET | /orders/:id?contact= | Order |

Still to build in the backend: auth (hashed passwords, httpOnly sessions), payment webhooks
(source of truth for `paymentStatus`), shipping/tracking, reviews moderation, newsletter, admin CRUD
for products, categories, orders, customers, inventory, coupons, reviews, blogs, banners, homepage sections, shipping, payments and settings.

The Next.js `/api/*` routes are a public, validated facade the website (and app) can use today.
