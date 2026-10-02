# Verdant Roots — WordPress + WooCommerce theme

Same design as the Next.js storefront (same colours, fonts, spacing, components), but as a
classic PHP theme so products, orders, payments, shipping, coupons and customers are all
managed in **WooCommerce**. WooCommerce stays in charge of the business logic; the theme
only presents it.

## Requirements
WordPress 6.4+, PHP 8.0+, WooCommerce 8.5+.

## Install
1. Copy `wp-theme/verdant-roots/` into `wp-content/themes/` (or zip that folder and upload it under
   *Appearance → Themes → Add New*).
2. Install and activate **WooCommerce** and finish its setup wizard (currency INR, country, payments, shipping).
3. Activate **Verdant Roots**. On activation it (once) creates the pages the design expects
   (About, Contact, FAQ, Track Order, Wishlist, Categories, policy pages), sets the static front
   page (Home) and posts page (Blog), and switches Cart/Checkout to WooCommerce's classic
   shortcodes, which the theme styles.
4. *Appearance → Customize → Verdant Roots store settings*: announcement bar text, hero text,
   contact details, social links, which categories appear on the home page, etc.
   The **Trust strip** (thin scrolling bar under the hero) is filled here too: one item per line as
   `Label | Detail | Logo URL`, e.g. `FSSAI | Lic. No. 1234567890 | https://…/fssai.png`. Add only licences you really hold;
   leave it empty and visitors see no strip.
   To feature a product under **Best Selling Products** on the home page, edit it and tick the box in the right-hand column.
   **Product ads** videos (max 3, MP4/WebM, up to 15 MB each) are uploaded in Customize → *Product ads (videos)*.
   **From Our Feed** (above Helpful guides): paste YouTube / Instagram links in Customize → *From Our Feed* (up to 6).
   **Offer banner** (under From Our Feed): text, code, colour and end date in Customize → *Offer banner*; create the matching coupon in WooCommerce → Marketing → Coupons.
   **Home FAQs** (under Helpful guides): up to 8 questions/answers in Customize → *Home FAQs*; add your delivery and returns answers there.
   **Bulk Order** page + form: created automatically when you open wp-admin after updating; enquiries arrive by email and under *Bulk enquiries* in wp-admin; recipient and request types in Customize → *Bulk order form*.
5. *Appearance → Menus*: optional. Without menus the theme uses sensible built-in defaults
   (locations: Primary, Footer, Support, Policy).

## Connecting products (WooCommerce)
Everything comes from WooCommerce — nothing is hard-coded in templates.

| Storefront element | Comes from |
|---|---|
| Categories, mega menu, home sections | Products → **Categories** (top-level categories, drag to order; category image = card image; description = card text) |
| Prices, MRP + discount % | **Regular price** (MRP) and **Sale price** (current price); variable products use each variation |
| Size / weight selector | Global product attribute **Size** (variations) |
| Filters | Price, rating, stock, and every global attribute (Size, Product type…) automatically |
| Best Seller badge / home section | Product tag **`best-seller`** (configurable in the Customizer) |
| New badge | Products created in the last 30 days |
| Featured card in mega menu | Product marked **Featured** (star) |
| Ingredients, how to use, storage, nutrition, highlights, FAQs | Meta box **"Verdant Roots: product details"** on the product edit screen. Empty fields show an honest "to be provided" note — nothing is invented |
| Category FAQs | Category edit screen → "FAQs" |
| Reviews & ratings | WooCommerce reviews (only real, approved reviews are ever shown, including on the home page) |
| Product schema, breadcrumbs schema | WooCommerce structured data |

Products without photos show generated placeholder artwork (the same as the Next.js site).

### Try it with sample products
Sample catalogue (31 demo products, exported from the Next.js demo data) in WooCommerce's own CSV format:

```bash
wp eval-file wp-content/themes/verdant-roots/demo/import-demo.php
```
or import `demo/sample-products.csv` from *Products → Import*. All sample products carry the tag
`demo` — delete them (Products → filter by tag) before you go live. Regenerate the CSV with
`node --experimental-strip-types scripts/export-woo-csv.ts` (from the repo root).

## Before you go live (WooCommerce settings)
* **WooCommerce → Settings → Site visibility → Live.** New stores start in "Coming soon" mode, which hides the
  whole shop from logged-out visitors.
* Shipping: create a zone with **Flat rate** (e.g. ₹49) and **Free shipping** (minimum order ₹499). When free shipping
  applies the theme offers only that method (turn off with `add_filter( 'vr_hide_paid_shipping_when_free', '__return_false' );`).
  The Customizer "free shipping threshold" is display text only — keep it equal to the WooCommerce rule.
* Payments: enable Cash on Delivery and install your gateway plugin (Razorpay, PayU, Cashfree…). Test in the gateway's sandbox first.
* Remove the `demo` products; add real photos, ingredients and prices.

## What is native WooCommerce (and therefore unchanged)
Cart, coupons (code, type, value, min/max, expiry, usage limit), checkout, payment gateways
(Razorpay, UPI, cards, COD… whichever plugins you enable — card details never touch this site),
shipping zones and free-shipping rules, taxes, stock, orders, emails, My Account, order
tracking (`[woocommerce_order_tracking]` on the Track Order page), guest checkout.

## Theme features added
Announcement bar · sticky header · accessible mega menu · search with suggestions, recent
searches and no-results state (searches product names, categories and tags) · quick view · wishlist (guest cookie → account on login) ·
filter sidebar/drawer · Buy Now · free-shipping progress in cart · mobile bottom navigation ·
blog with categories/featured/popular/share/related · newsletter (uses your form shortcode or emails the admin) ·
404 and empty states.

## Differences from the Next.js storefront (be aware)
* **Order statuses** are WooCommerce's (Pending, Processing, On hold, Completed, Cancelled, Refunded, Failed). The
  7-step timeline (Packed, Shipped, Out for delivery…) needs a shipment-tracking plugin or custom statuses.
* **SEO**: the theme adds `title-tag`, canonical (WordPress core) and WooCommerce's structured data. For meta
  descriptions, Open Graph and XML sitemaps beyond core, install **Yoast SEO** or **Rank Math**.
* **Contact form / FAQ schema for the FAQ page**: use Contact Form 7 / WPForms for the form.
* **Demo/sample reviews**: not created — the review section stays hidden until real reviews exist.
* **Wishlist** is cookie/user-meta based; if you use full-page caching, exclude the wishlist page.
* Fonts load from Google Fonts; self-host them if GDPR requires.

## Development (rebuilding CSS)
Styles are Tailwind CSS 4, compiled to `verdant-roots/assets/css/main.css` (committed).
From the repo root: `npm install && npm run build:theme` (or `npm run dev:theme` to watch).
Design tokens live in `wp-theme/src/theme.css` and mirror `src/app/globals.css`.
