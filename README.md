# Verdant Roots — natural products storefront

Production-oriented e-commerce frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Zustand, Zod.
Brand name is a placeholder; set `NEXT_PUBLIC_BRAND_NAME`.

## Run
```bash
npm install
cp .env.example .env.local   # optional; defaults run in demo mode
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
npm run typecheck
```

## Structure
- `src/config/site.ts` — brand, announcement text, shipping rules, payment options, nav (all editable)
- `src/types` — Product, Category, Order, Coupon … (admin/app-ready model)
- `src/data/demo` — **demo data only**; `src/lib/data` — repository (demo | http backend)
- `src/app` — pages + `/api/*` routes; `src/components` — reusable UI; `src/store` — cart/wishlist/etc.
- `docs/API_CONTRACT.md` — backend contract shared with the future mobile app

## What is real vs. demo
- Real: catalogue browsing, filters/sort/pagination (URL based), search, cart, coupons (server-validated), checkout validation, server-side price recomputation, SEO (metadata, sitemap, robots, JSON-LD), skeletons and error/empty states.
- Demo: products, blog, sample reviews (labelled). Orders/addresses/sessions stay in the browser and are labelled as demo.
- Not implemented (needs backend/credentials): real login, order persistence, order tracking data, online payments (Razorpay adapter written but untested against live keys), newsletter/contact delivery. These routes return honest 501/503 errors.
- Demo sites are `noindex` until `NEXT_PUBLIC_ALLOW_INDEXING=true`.

## Assumptions
Currency INR; free shipping over ₹499 else ₹49; brand "Verdant Roots"; guests can wishlist locally; images are generated placeholders until real photos are added (`images[].src`); policy pages are templates needing legal review.
