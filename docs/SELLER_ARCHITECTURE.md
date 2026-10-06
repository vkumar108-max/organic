# STORELAUNCH — Seller Dashboard / Store Builder (Part 2): architecture

Status: **design + interactive HTML demo**. The production implementation (Next.js + Prisma) is not built yet.
The demo (separate from the Super Admin demo) simulates the full flow in the browser with the same data
rules the server will enforce.

## 1. Architecture overview
Next.js 15 App Router, Server Components + Server Actions, Prisma/PostgreSQL, same stack as Part 1.
A separate app (`apps/seller`) sharing one Prisma schema with the Super Admin (`User` / `Store` / `Theme` are shared).
The Customer Storefront will read published store data through a read-only API/query layer (never the builder's draft state).

## 2. Folder structure
```
prisma/schema.prisma       shared schema (+ seller models below)
src/app/(auth)/            signup, login, forgot-password, reset-password
src/app/onboarding/        step 1 create store, step 2 choose theme
src/app/(dashboard)/       overview, builder, products, categories, orders, customers, inventory, coupons,
                           payments, shipping, analytics, themes, pages, domains, mobile-app, settings
src/server/tenant/         requireStore() -> { user, store, role }  (the ONLY entry to store data)
src/server/<feature>/      queries.ts, actions.ts, schemas.ts       (every function takes StoreCtx)
src/features/builder/      section registry, property forms, preview renderer
src/features/themes/       theme definitions (tokens + default sections)
```

## 3. Database schema (Prisma models)
User, Store (status SETUP|DRAFT|PUBLISHED|UNPUBLISHED, slug unique), StoreMember (user, store, role OWNER|STAFF, unique pair),
Theme (shared catalogue), ThemeConfig (storeId unique: themeId, brand tokens JSON, header/footer JSON),
StoreSection (storeId, type, props JSON, visible, position), Category (storeId, position), Product (storeId, status),
ProductVariant (productId, storeId, sku unique per store, stock, trackInventory), InventoryAdjustment (log),
Customer (storeId, unique storeId+email), Order (storeId, number unique per store, status, paymentStatus),
OrderItem, OrderEvent (timeline), Coupon (storeId, code unique per store, scope + targets), Payment,
PaymentMethodConfig (storeId, provider, enabled; secrets are *references* to server env/secret store, never values),
ShippingZone, ShippingRate, Page (storeId, slug unique per store), Domain (storeId), AppBuild (storeId, status).
Every tenant table has `storeId` NOT NULL, a FK to Store, and an index starting with `storeId`.

## 4. Seller authentication flow
Sign up (email + password, bcrypt) -> opaque DB session cookie (same design as Part 1) -> onboarding if the user has no store
-> dashboard. Forgot password issues a single-use, hashed, expiring `AuthToken`; reset invalidates all sessions.

## 5. Multi-tenant security
- The store is **never taken from the URL/body**. `requireStore()` resolves it from the session via `StoreMember`.
- Every query/action receives `ctx.storeId` and includes it in the `where` (`findFirst({ where: { id, storeId } })`).
  Lookups by id alone are forbidden by convention and by a lint rule/wrapper (`scoped(storeId)` Prisma extension that injects `storeId`).
- Cross-tenant ids return 404 (not 403) so existence isn't leaked. Composite FKs (`productId, storeId`) stop mixing tenants in joins.
- Optional defence in depth: Postgres Row Level Security with `SET app.store_id`.
- Secrets (Razorpay/Stripe) live in a secret store; the UI only shows connected / not connected.

## 6. Theme architecture
A theme is **data**: tokens (colors, fonts, radius), layout variants (header/footer/card/button) and a default section list.
A store's `ThemeConfig` copies the tokens at selection time so the seller can tweak them. Products, categories, customers, orders and
inventory never reference theme tables, so switching a theme only rewrites ThemeConfig (optionally resetting tokens) and keeps sections.

## 7. Store Builder architecture
Sections are rows with `type`, `props` JSON (validated per type by zod), `visible`, `position`. A registry maps type -> {schema, form, render}.
The preview renders the same registry the storefront will use, from draft state, at desktop/tablet/mobile widths. Publishing copies draft
to a published snapshot (`publishedConfig`) so editing never changes the live store until the seller publishes.

## 8. API / server-action structure
`createStoreAction({ permission, schema, handler })` wraps: session -> store membership -> validation -> handler(ctx{storeId}) -> audit -> revalidate.

## 9. Implementation phases
1. Auth + onboarding + tenancy core. 2. Catalog (products, variants, categories, inventory). 3. Orders + customers.
4. Builder + themes + pages. 5. Coupons, payments, shipping. 6. Analytics, domains, mobile-app module, publish checklist.
7. Demo store (FreshMart) + isolation tests.
