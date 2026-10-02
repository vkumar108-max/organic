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

### Trust strip (licences) under the hero
A thin, always-scrolling strip sits right under the home hero. Fill it in *Appearance → Customize → Verdant Roots store
settings → Trust strip*, one item per line as `Label | Detail | Logo URL` (detail and logo are optional), e.g.
`FSSAI | Lic. No. 1234567890 | https://yourstore.com/wp-content/uploads/fssai.png`. Upload logos in *Media* and paste the URL.
Add **only licences and certificates you actually hold** (FSSAI, GST, Udyam, ISO…) — the theme never invents any. With nothing saved,
visitors see no strip; logged-in admins see a clearly-labelled sample so they know where it goes. It pauses on hover/focus, has a
pause button, and stops animating for visitors who prefer reduced motion.

### Categories rail (auto-sliding round icons)
Right under the trust strip the home page shows a "Categories" row of round icons that slides on its own and loops forever.
It lists your top-level product categories (Products → Categories; drag to order). The round image is the **category image**;
categories without one get the generated placeholder artwork. It pauses on hover/focus/touch, has a pause button and prev/next
arrows, can be swiped or scrolled by hand, and does not move for visitors who prefer reduced motion.

### Best Selling Products (home page carousel)
Under the Categories rail: a tinted band with swipeable product cards, big rank numbers and prev/next arrows.
**To add any product later:** edit the product → tick **"Show in Best Selling Products on the home page"** in the right-hand box
(untick to remove). Optional **Position** sets the order (1 = first); without it products are ordered by sales. Behind the
scenes this adds/removes the `best-seller` tag (name configurable in the Customizer), so the "Best seller" badge, the shop tag
filter and *Products → Bulk edit → Tags* all work too. While no product is ticked/tagged the carousel shows your most popular
products instead; "See all" opens the best-seller tag page. With **no published products at all** the section is hidden from visitors,
but logged-in admins see a dashed preview with instructions (products must be *Published*, not Draft).

### Herbal & Wellness (four category cards)
Under Best Selling Products: a heading plus four tinted cards — **Herbal Powder, Superfood Powder, Immunity Products, Nutrition Products** —
each with a short text, an Explore button and the category image (placeholder art until you set one). The four are created **once**
as normal WooCommerce product categories the first time an admin opens wp-admin after installing the theme (Products → Categories), so you can
assign products to them straight away; rename/delete/re-describe them freely — they are not re-created. Set images in
*Products → Categories → Thumbnail*. Heading and which categories (up to 4, in order) are in *Customize → Verdant Roots store settings →
Herbal & Wellness section*. Keep product wording within what is lawful for your products (no disease or cure claims).

### Our Featured Products (auto-sliding, every 5 seconds)
Under Herbal & Wellness: a deep-green panel with the heading plus a carousel that moves to the next product every **5 seconds**
(and loops back to the start). It shows the products you star as **Featured** in WooCommerce: *Products* list → click the ☆ in the
Featured column (or Quick Edit / the product's *Catalog visibility → Featured*). It pauses on hover, keyboard focus and touch, has a pause
button and prev/next arrows, can be swiped, and never autoplays for visitors who prefer reduced motion. Heading is in the Customizer
(*Featured products section*). Visitors see nothing until at least one product is Featured; admins see a dashed preview with instructions.

### Product ads (up to 3 videos)
Under Our Featured Products. Upload the videos in **Appearance → Customize → Product ads (videos)**: three slots, each with an optional
cover image, caption and product/page link ("Shop now" button), plus an optional heading and a video-shape choice (Auto / Landscape / Portrait / Square).
**Limits:** max 3 videos; **MP4 (H.264) or WebM only** (not .mov); each file up to **15 MB** (the Customizer refuses bigger files with a message;
change with `add_filter( 'vr_ad_video_max_mb', fn() => 25 );`). Tips: 15–30 s, 720p, little or no sound. **Phones** get a swipeable row, **desktop**
shows them side by side (a single video is centred). Videos are muted and loop, load/play only while on screen (and only the visible one on phones),
do not autoplay with Data Saver or reduced-motion (visitor taps play), have a pause button and a sound toggle (one video with sound at a time).
Add a cover image so nothing is downloaded until the visitor scrolls near it. No videos set = visitors see nothing; admins see a note with a link to the setting.

### "Our Story" banner
A full-width banner under the product videos (ships with the Lord Dhanvantari "Our Story" artwork, `assets/img/our-story-banner.webp`, 1983 × 800, ~175 KB).
Desktop shows the whole banner; phones show the centre of it so the headline stays readable. Click-through goes to your **About Us** page (or the link you set).
Change or hide it in *Customize → Story banner*: replace the image (best 2000 × 800 px, under 300 KB, keep headline text in the centre), edit the alt text,
set a link, or untick "Show the banner". Keep any statements about healing within what you can substantiate.

### From Our Feed (YouTube / Instagram)
Above "Helpful guides": a centred carousel of portrait video cards (the middle card is emphasised; arrows + swipe). Set it in
*Customize → From Our Feed*: paste up to **6** links per slot — YouTube (`watch?v=`, `youtu.be`, Shorts, live) or a public Instagram reel / post — plus an optional
caption and cover image. Tapping a card opens the video in a pop-up player (closes with ✕, Esc or a tap outside; playback stops on close). Links are
checked when you save (anything that is not a recognisable YouTube/Instagram link is refused) and the player address is rebuilt from the video id only,
so only youtube-nocookie.com and instagram.com embeds can ever load. Nothing from YouTube/Instagram is loaded until a card is tapped, except YouTube cover images
(from i.ytimg.com). **Instagram does not share covers**, so upload a cover image for Instagram items (they show a gradient until you do); private accounts, stories and some
posts cannot be embedded. Without JavaScript each card is a normal link that opens the original video in a new tab. If GDPR applies to you, mention YouTube/Instagram in your privacy policy.
With no links set visitors see nothing; admins see a note linking to the setting.

### Offer banner ("Limited Time Offer! … use code …")
A coloured banner under From Our Feed: small heading, offer text, the coupon code (with a **Copy** button) and a button (default "Start Snacking Smart" → Shop).
Everything is in *Customize → Offer banner*: texts, code, button link, an **end date** (the banner hides itself after it — set one so "limited time" is true), and a
**colour picker** (the text colour switches between white and deep green automatically for readability). Defaults: 5% OFF on your first order, code `DHANVANTARI108`.
**The banner only advertises the code — the discount is a WooCommerce coupon** (*Marketing → Coupons*: Percentage discount, 5, *Usage limit per user* 1, no minimum spend
unless the banner says so). Admins see a note with a one-click "Create coupon" button on the banner while the coupon does not exist. WooCommerce cannot tell whether a customer has
ordered before, so "first order" is only softly enforced by the one-use-per-customer limit; use a plugin for a strict first-order rule or reword the banner.

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
