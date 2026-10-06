# STORELAUNCH — Customer Storefront (Part 3): architecture

Status: **design + interactive HTML demo** (separate from the Admin and Seller demos). The production implementation
(Next.js + Prisma) is not built yet; the demo runs the same server-side rules in a simulated API layer.

## 1. Storefront architecture
Next.js 15 App Router, Server Components for all catalog pages (SSR + ISR/`revalidateTag`), small client islands for
cart, gallery, filters, checkout. Reads the shared Prisma schema. Reads **published** data only, never builder drafts.
A dedicated read layer `getStoreBySlug()` / `getStoreByHost()` is the only way to obtain a tenant.

## 2. Folder structure
```
apps/storefront/src/
  app/store/[slug]/                layout.tsx (tenant + theme), page.tsx (home)
  app/store/[slug]/shop|category/[cat]|product/[product]|search|cart|checkout|order-confirmation/[no]|account|track|page/[page]
  app/api/store/[slug]/{cart/quote,checkout,payment/verify,auth,account,track}/route.ts
  app/sitemap.ts  app/robots.ts
  middleware.ts                    custom-domain host -> slug rewrite
  server/tenant/ server/catalog/ server/cart/ server/checkout/ server/payments/ server/orders/ server/customers/
  features/theme/                  tokens -> CSS variables, layout variants
  features/{header,home,catalog,product,cart,checkout,account,tracking}/
```

## 3. Route structure
`/store/{slug}` · `/shop` · `/category/{slug}` · `/product/{slug}` · `/search?q=` · `/cart` · `/checkout` ·
`/order-confirmation/{orderNo}` · `/account` (+ `/orders/{no}`, `/addresses`) · `/track` · `/page/{slug}`.
Custom domains: middleware maps `Host: www.freshmart.com` -> `Domain` row -> same routes (slug prefix hidden).

## 4. Database / API integration plan
Every read goes through `tenantDb(storeId)` (scoped Prisma extension that adds `storeId` to every `where`).
Public DTOs (never raw rows) exclude cost, drafts, other tenants, payment secrets. Store is resolved from the URL slug
or host on the server; any `storeId` in a request body is ignored (mismatch -> 403).

## 5. Theme rendering architecture
`ThemeConfig` (tokens + variants: header, card, button, category layout, PDP layout) -> CSS variables on the store root.
Theme tables are never joined into product/order writes, so a theme change cannot modify store data.

## 6. Cart architecture
The browser keeps only `{productId, variantId, qty}` per store (cookie/localStorage key includes the slug).
Prices, stock, titles, discounts and shipping are always recomputed by `cart.quote` on the server.

## 7. Checkout architecture
Steps: customer -> address -> delivery -> payment -> review. Delivery options come from the store's ShippingZone rules for the
address. Payment methods come from the store's enabled PaymentMethodConfig (secrets stay server-side).

## 8. Order creation flow (server, one transaction)
1 resolve store from slug -> 2 validate session/customer -> 3 load products & variants *from this store* -> 4 availability ->
5 variants -> 6 current DB prices -> 7 inventory (row lock / conditional update) -> 8 coupon (all rules) -> 9 subtotal ->
10 discount -> 11 shipping -> 12 total -> 13 upsert Customer (store-scoped) -> 14 Order + OrderItems (price snapshot) ->
15 decrement stock -> 16 Payment (PENDING) -> 17 return confirmation (+ gateway intent for online methods).
Online payments: webhook / `payment.verify` checks the gateway signature with a server-only secret before marking PAID.

## 9. Multi-store security
Slug -> store resolved server-side only. Composite uniques/FKs include `storeId`. Cross-tenant ids return 404. Customer sessions are
bound to one store; orders are fetched with `{ id, storeId, customerId }`. Coupons/shipping/payment config are loaded by `storeId`.

## 10. Implementation phases
1 Tenant resolution + theme + home. 2 Catalog (category, product, search). 3 Cart + quote + coupons + shipping.
4 Checkout + order creation + inventory. 5 Payments (COD, Razorpay, Stripe) + verification. 6 Account + tracking.
7 SEO (metadata, JSON-LD, sitemap, robots) + performance (ISR, image optimisation). 8 Custom domains + tests.
