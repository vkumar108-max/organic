/**
 * DEMO seed — development / investor demos only.
 * Refuses to run when NODE_ENV=production unless ALLOW_DEMO_SEED=true. Run the core seed first.
 * Deterministic (seeded RNG) so every environment shows the same story. Dates are relative to "now".
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import "dotenv/config";

if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "true") {
  console.error("Refusing to seed demo data in production (set ALLOW_DEMO_SEED=true to override).");
  process.exit(1);
}

const db = new PrismaClient();

// ───────── deterministic helpers ─────────
let s = 20260401;
const rnd = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const int = (a: number, b: number) => Math.floor(rnd() * (b - a + 1)) + a;
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)]!;
const chance = (p: number) => rnd() < p;
const weighted = <T,>(xs: readonly (readonly [T, number])[]): T => { const tot = xs.reduce((a, [, w]) => a + w, 0); let r = rnd() * tot; for (const [v, w] of xs) { if ((r -= w) <= 0) return v; } return xs[0]![0]; };
const NOW = Date.now();
const DAY = 86400_000;
const ago = (days: number) => new Date(NOW - days * DAY - int(0, 86_000) * 1000 % DAY);
/** Recent-skewed day offset (platform growth: more activity lately). */
const recentDays = (max: number) => Math.floor(max * Math.pow(rnd(), 1.7));
const money = (n: number) => Math.round(n * 100) / 100;
const id = () => randomUUID();
const slugify = (x: string) => x.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const chunk = <T,>(xs: T[], n = 1000) => Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, i * n + n));

const shuffleStatuses = <T,>(xs: T[]) => { for (let i = xs.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [xs[i], xs[j]] = [xs[j]!, xs[i]!]; } return xs; };
const NAME_ADJ = ["Golden", "Urban", "Little", "Northern", "Coastal", "Modern", "Wild", "Velvet", "Bright", "Quiet", "Daily", "Royal", "Fresh", "Rustic", "Atlas", "Ember", "Sage", "Willow", "Copper", "Harbor"];
const NAME_NOUN: Record<string, string[]> = { fashion: ["Threads", "Closet", "Denim Co.", "Atelier", "Wardrobe", "Apparel", "Loom"], grocery: ["Market", "Basket", "Pantry", "Greens", "Grocer", "Harvest"], restaurant: ["Kitchen", "Table", "Bistro", "Eatery", "Grill", "Cantina"], electronics: ["Gadgets", "Tech", "Circuit", "Devices", "Audio", "Labs"], food: ["Pantry", "Bakehouse", "Spice Co.", "Larder", "Tea House", "Chocolatier"], "digital-products": ["Studio", "Templates", "Assets", "Press", "Sounds", "Presets"] };
const FIRST = ["Priya", "Liam", "Sofia", "Noah", "Aisha", "Mateo", "Hannah", "Arjun", "Chloe", "Omar", "Elena", "Kenji", "Zara", "Lucas", "Maya", "Ethan", "Fatima", "Oliver", "Isabella", "Rohan", "Amara", "Daniel", "Yuki", "Gabriel", "Nora", "Samuel", "Leila", "Marcus", "Anya", "Tomas", "Grace", "Ibrahim", "Camila", "Felix", "Sana", "Victor", "Ingrid", "Dev", "Rosa", "Jonas"];
const LAST = ["Sharma", "Carter", "Rossi", "Nguyen", "Khan", "Garcia", "Mueller", "Patel", "Dubois", "Haddad", "Petrova", "Tanaka", "Ahmed", "Silva", "Okafor", "Brooks", "Hassan", "Bennett", "Moreno", "Mehta", "Adeyemi", "Kim", "Sato", "Costa", "Larsen", "Reid", "Farah", "Webb", "Volkov", "Novak", "Hughes", "Yilmaz", "Reyes", "Weber", "Iyer", "Duarte", "Berg", "Kapoor", "Alvarez", "Schmidt"];
const CITIES: [string, string][] = [["Austin", "United States"], ["Toronto", "Canada"], ["London", "United Kingdom"], ["Mumbai", "India"], ["Berlin", "Germany"], ["Sydney", "Australia"], ["Dubai", "UAE"], ["Singapore", "Singapore"], ["Lisbon", "Portugal"], ["Nairobi", "Kenya"], ["São Paulo", "Brazil"], ["Amsterdam", "Netherlands"], ["Denver", "United States"], ["Bengaluru", "India"], ["Melbourne", "Australia"]];

type Cat = "fashion" | "grocery" | "restaurant" | "electronics" | "food" | "digital-products";
const CAT_NAME: Record<Cat, string> = { fashion: "Fashion", grocery: "Grocery", restaurant: "Restaurant", electronics: "Electronics", food: "Food", "digital-products": "Digital Products" };
const STORE_NAMES: Record<Cat, string[]> = {
  fashion: ["Threadwell", "Indigo & Oak", "Urban Loom", "Maison Aria", "Silk Route Apparel", "Northbound Denim", "Velvet Hour", "Thistle & Thread", "Atelier Nova"],
  grocery: ["Green Basket", "FreshCrate Market", "Harvest Lane", "Daily Pantry", "Orchard Co-op", "Metro Greens"],
  restaurant: ["Saffron Table", "The Ember Kitchen", "Basil & Brine", "Umami House", "Casa Lumen", "Spice Garden Bistro"],
  electronics: ["VoltEdge", "Circuit Haven", "PixelPeak Gadgets", "Nimbus Tech", "Arc Audio", "Gadget Grove", "Orbit Mobile"],
  food: ["Honeycomb Kitchen", "Bake & Bloom", "The Spice Pantry", "Crumb Theory", "Cocoa Cartel", "Wild Leaf Tea Co."],
  "digital-products": ["PixelCraft Studio", "Notion Nest Templates", "CodeCanvas", "Beat Bazaar", "Lumen Presets", "Inkwell eBooks"],
};
const PRODUCTS: Record<Cat, [string, number][]> = {
  fashion: [["Linen Button-Down Shirt", 54], ["High-Rise Straight Jeans", 78], ["Merino Crewneck Sweater", 92], ["Canvas Tote Bag", 28], ["Wrap Midi Dress", 84], ["Leather Belt", 39], ["Cotton Everyday Tee", 24]],
  grocery: [["Organic Avocados (4 pk)", 7.5], ["Cold-Pressed Olive Oil 1L", 18], ["Free-Range Eggs (12)", 6.2], ["Sourdough Loaf", 6.8], ["Oat Milk 1L", 3.9], ["Mixed Berry Box", 9.5]],
  restaurant: [["Chef's Tasting Box for Two", 64], ["Margherita Pizza", 16], ["Pad Thai", 15], ["Lamb Biryani", 19], ["Tiramisu Jar", 8], ["Craft Lemonade (6)", 18]],
  electronics: [["Wireless Earbuds Pro", 89], ["USB-C GaN Charger 65W", 39], ["Mechanical Keyboard 75%", 129], ["4K Webcam", 99], ["Portable SSD 1TB", 109], ["Smart LED Desk Lamp", 45]],
  food: [["Wildflower Honey 500g", 14], ["Artisan Granola", 11], ["Single-Origin Dark Chocolate", 9], ["Masala Chai Blend", 12], ["Hot Sauce Trio", 21], ["Almond Butter", 10]],
  "digital-products": [["Notion Productivity Template", 29], ["Lightroom Preset Pack", 35], ["UI Icon Set (SVG)", 49], ["Lo-fi Beat Bundle", 25], ["Photography eBook", 19], ["Resume Template Pack", 15]],
};

async function main() {
  if ((await db.seller.count()) > 0) { console.error("Demo data already present. Run `npm run db:reset:demo` to start over."); process.exit(1); }
  const roles = new Map((await db.role.findMany()).map((r) => [r.key, r.id]));
  if (!roles.size) throw new Error("Run the core seed first: npm run db:seed");
  const plans = await db.plan.findMany();
  const plan = (k: string) => plans.find((p) => p.key === k)!;
  const cats = new Map((await db.themeCategory.findMany()).map((c) => [c.key, c.id]));

  // ───────── demo admin staff ─────────
  const demoPw = await bcrypt.hash(process.env.DEMO_ADMIN_PASSWORD ?? "Demo!Passw0rd12", 12);
  const owner = await db.user.findFirstOrThrow({ orderBy: { createdAt: "asc" } });
  const staff = [["Alex Morgan", "admin@storelaunch.test", "admin"], ["Sam Rivera", "support@storelaunch.test", "support_admin"], ["Jordan Lee", "finance@storelaunch.test", "finance_admin"], ["Taylor Brooks", "themes@storelaunch.test", "theme_manager"], ["Casey Nguyen", "support2@storelaunch.test", "support_admin"]] as const;
  const staffUsers: { id: string; email: string; role: string }[] = [];
  for (const [name, email, role] of staff) {
    const u = await db.user.create({ data: { name, email, passwordHash: demoPw, passwordChangedAt: new Date(), lastLoginAt: ago(int(0, 3)), roles: { create: { roleId: roles.get(role)! } } } });
    staffUsers.push({ id: u.id, email, role });
  }
  await db.user.update({ where: { id: owner.id }, data: { lastLoginAt: new Date() } });
  const adminOf = (role: string) => staffUsers.find((u) => u.role === role) ?? { id: owner.id, email: owner.email, role: "super_admin" };

  // ───────── themes ─────────
  const themeDefs: [string, Cat, "PUBLISHED" | "DRAFT" | "UNPUBLISHED", boolean, string][] = [
    ["Runway", "fashion", "PUBLISHED", true, "2.1.0"], ["Boutique Classic", "fashion", "PUBLISHED", false, "1.4.2"], ["Streetwear Edge", "fashion", "PUBLISHED", false, "1.0.3"],
    ["Fresh Market", "grocery", "PUBLISHED", true, "1.6.0"], ["Pantry Pro", "grocery", "PUBLISHED", false, "1.2.0"],
    ["Bistro", "restaurant", "PUBLISHED", true, "2.0.1"], ["Chef's Table", "restaurant", "PUBLISHED", false, "1.1.0"],
    ["Voltage", "electronics", "PUBLISHED", true, "3.0.0"], ["Gadget Grid", "electronics", "PUBLISHED", false, "1.3.5"], ["Neon Tech", "electronics", "UNPUBLISHED", false, "0.9.4"],
    ["Artisan Kitchen", "food", "PUBLISHED", false, "1.5.0"], ["Sweet Crumb", "food", "PUBLISHED", false, "1.0.0"],
    ["Download Hub", "digital-products", "PUBLISHED", true, "1.8.0"], ["Creator Studio", "digital-products", "DRAFT", false, "0.3.0"],
  ];
  const themes: { id: string; cat: Cat; pubStatus: string }[] = [];
  for (const [name, cat, status, featured, version] of themeDefs) {
    themes.push({ cat, pubStatus: status, ...(await db.theme.create({ data: { name, slug: slugify(name), categoryId: cats.get(cat)!, status, isFeatured: featured, version, isActive: status !== "UNPUBLISHED" || chance(0.5), publishedAt: status === "PUBLISHED" ? ago(int(30, 300)) : null, previewImageUrl: `/theme-previews/${cat}.svg`, description: `${name}: a ${CAT_NAME[cat].toLowerCase()} storefront theme with a responsive layout, quick-view product cards and a conversion-focused checkout.`, createdAt: ago(int(60, 400)), updatedAt: ago(int(0, 40)) } })) });
  }
  const themeFor = (cat: Cat) => { const c = themes.filter((t) => t.cat === cat && t.pubStatus === "PUBLISHED"); return c.length ? pick(c).id : null; };

  // ───────── sellers & stores ─────────
  const statusPlan = shuffleStatuses([...Array(92).fill("ACTIVE"), ...Array(9).fill("PENDING"), ...Array(4).fill("SUSPENDED"), ...Array(3).fill("BLOCKED"), ...Array(5).fill("REJECTED")]) as ("ACTIVE" | "PENDING" | "SUSPENDED" | "BLOCKED" | "REJECTED")[];
  const sellerRows: Prisma.SellerCreateManyInput[] = [];
  const storeRows: Prisma.StoreCreateManyInput[] = [];
  const usedBiz = new Set<string>(), usedEmails = new Set<string>(), usedSlugs = new Set<string>(), usedNames = new Set<string>();
  const catKeys = Object.keys(STORE_NAMES) as Cat[];
  const sellers: { id: string; status: string; planKey: string; created: Date; name: string }[] = [];
  const stores: { id: string; sellerId: string; cat: Cat; created: Date; status: string; slug: string }[] = [];

  statusPlan.forEach((status, i) => {
    let first = pick(FIRST), last = pick(LAST), name = `${first} ${last}`;
    while (usedNames.has(name)) { first = pick(FIRST); last = pick(LAST); name = `${first} ${last}`; }
    usedNames.add(name);
    const [city, country] = pick(CITIES);
    const cat = catKeys[i % catKeys.length]!;
    let baseName = i < catKeys.length * 2 ? STORE_NAMES[cat][Math.floor(i / catKeys.length) % STORE_NAMES[cat].length]! : `${pick(NAME_ADJ)} ${pick(NAME_NOUN[cat]!)}`;
    while (usedBiz.has(baseName)) baseName = `${pick(NAME_ADJ)} ${pick(NAME_NOUN[cat]!)}`;
    usedBiz.add(baseName);
    const biz = status === "PENDING" || status === "REJECTED" ? `${baseName}` : baseName;
    const created = status === "PENDING" ? ago(int(0, 6)) : ago(recentDays(420) + 2);
    let email = `${first}.${last}@${slugify(biz)}.example`.toLowerCase().replace(/[^a-z0-9.@-]/g, "");
    if (usedEmails.has(email)) email = `${first}${i}.${last}@${slugify(biz)}.example`.toLowerCase();
    usedEmails.add(email);
    const sid = id();
    const planKey = status === "ACTIVE" ? weighted([["free", 4], ["starter", 11], ["growth", 12], ["pro", 7]] as const) : status === "PENDING" || status === "REJECTED" ? "free" : weighted([["starter", 2], ["growth", 2], ["pro", 1]] as const);
    sellerRows.push({
      id: sid, code: `SLR-${1001 + i}`, name, email, phone: `+${int(1, 91)} ${int(200, 999)} ${int(100, 999)} ${int(1000, 9999)}`, businessName: biz, country, city, address: `${int(10, 980)} ${pick(["Market", "Cedar", "Harbor", "Elm", "Union", "Maple"])} Street, ${city}`,
      status, statusReason: status === "REJECTED" ? pick(["Could not verify business details", "Prohibited product category"]) : status === "SUSPENDED" ? pick(["Repeated customer complaints", "Pending identity re-verification"]) : status === "BLOCKED" ? pick(["Confirmed fraudulent activity", "Chargeback abuse"]) : null,
      planId: plan(planKey).id, approvedAt: status === "PENDING" || status === "REJECTED" ? null : new Date(created.getTime() + DAY), lastActivityAt: status === "ACTIVE" ? ago(chance(0.5) ? int(0, 2) : int(2, 20)) : status === "PENDING" ? created : ago(int(15, 90)), createdAt: created, updatedAt: created,
    });
    sellers.push({ id: sid, status, planKey, created, name });

    if (status === "PENDING" || status === "REJECTED") return;
    const nStores = status === "ACTIVE" && planKey !== "free" && chance(0.3) ? 2 : 1;
    for (let k = 0; k < nStores; k++) {
      const scat = k === 0 ? cat : pick(catKeys.filter((c) => c !== cat));
      let sname = k === 0 ? baseName : `${pick(NAME_ADJ)} ${pick(NAME_NOUN[scat]!)}`;
      let slug = slugify(sname); while (usedSlugs.has(slug)) slug += `-${int(2, 99)}`; usedSlugs.add(slug);
      const sc = new Date(created.getTime() + int(1, 5) * DAY);
      const stStatus = status === "ACTIVE" ? weighted([["ACTIVE", 10], ["DRAFT", 1.5], ["DISABLED", 0.3]] as const) : status === "SUSPENDED" ? "SUSPENDED" : "SUSPENDED";
      const tid = stStatus === "DRAFT" && chance(0.5) ? null : themeFor(scat);
      const stid = id();
      storeRows.push({ id: stid, sellerId: sid, themeId: tid, name: sname, slug, category: CAT_NAME[scat], description: `${sname} — ${CAT_NAME[scat].toLowerCase()} products delivered with care from ${city}.`, status: stStatus, createdAt: sc, updatedAt: sc });
      stores.push({ id: stid, sellerId: sid, cat: scat, created: sc, status: stStatus, slug });
    }
  });
  await db.seller.createMany({ data: sellerRows });
  await db.store.createMany({ data: storeRows });

  // ───────── subscriptions & invoices ─────────
  const subRows: Prisma.SubscriptionCreateManyInput[] = [], invRows: Prisma.SubscriptionInvoiceCreateManyInput[] = [];
  let subN = 10001, invN = 50001;
  for (const sl of sellers) {
    if (sl.status === "PENDING" || sl.status === "REJECTED") continue;
    const p = plan(sl.planKey);
    const cycle = p.key !== "free" && chance(0.3) ? "YEARLY" : "MONTHLY";
    const amount = Number(cycle === "YEARLY" ? p.yearlyPrice : p.monthlyPrice);
    const storeOf = stores.find((x) => x.sellerId === sl.id);
    const started = new Date(sl.created.getTime() + 2 * DAY);
    const ageDays = Math.floor((NOW - started.getTime()) / DAY);
    let status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED" =
      sl.status === "ACTIVE" ? weighted([["ACTIVE", 18], ["TRIAL", 4], ["PAST_DUE", 2.5], ["CANCELLED", 1.5], ["EXPIRED", 1]] as const) : sl.status === "SUSPENDED" ? "PAST_DUE" : "CANCELLED";
    if (p.key !== "free" && ageDays < 13 && sl.status === "ACTIVE") status = "TRIAL";
    if (p.key === "free" && (status === "TRIAL" || status === "PAST_DUE")) status = "ACTIVE";
    const step = cycle === "YEARLY" ? 365 : 30;
    const subId = id();
    const cancelledAt = status === "CANCELLED" ? ago(int(3, Math.max(4, Math.min(ageDays, 120)))) : null;
    const offset = int(0, step - 1); // days since the latest billing period started
    const renewsAt = status === "CANCELLED" || status === "EXPIRED" ? null : new Date(NOW + (step - offset) * DAY);
    subRows.push({ id: subId, code: `SUB-${subN++}`, sellerId: sl.id, storeId: storeOf?.id, planId: p.id, billingCycle: cycle, amount, status, startedAt: started, trialEndsAt: status === "TRIAL" ? new Date(NOW + int(2, 13) * DAY) : null, renewsAt: status === "EXPIRED" ? null : renewsAt, cancelledAt, cancelReason: cancelledAt ? pick(["Switched to another platform", "Closing the business", "Too expensive", "Seasonal shutdown"]) : null, createdAt: started, updatedAt: started });
    if (amount > 0 && status !== "TRIAL") {
      const periods = Math.min(Math.floor(ageDays / step), cycle === "YEARLY" ? 1 : 12) + (status === "PAST_DUE" ? 1 : 0);
      for (let k = 0; k < Math.max(periods, 1); k++) {
        const ps = new Date(NOW - ((periods - 1 - k) * step + offset) * DAY), pe = new Date(ps.getTime() + step * DAY);
        if (ps < started) continue;
        const failed = status === "PAST_DUE" && k === periods - 1;
        if (cancelledAt && ps > cancelledAt) continue;
        invRows.push({ id: id(), number: `INV-${invN++}`, subscriptionId: subId, amount, status: failed ? "FAILED" : "PAID", periodStart: ps, periodEnd: pe, paidAt: failed ? null : new Date(ps.getTime() + int(0, 3) * 3600_000), description: `${p.name} plan — ${cycle === "YEARLY" ? "annual" : "monthly"} subscription`, createdAt: ps });
      }
    }
  }
  await db.subscription.createMany({ data: subRows });
  for (const c of chunk(invRows)) await db.subscriptionInvoice.createMany({ data: c });

  // ───────── customers, orders, payments ─────────
  const custRows: Prisma.CustomerCreateManyInput[] = [], orderRows: Prisma.OrderCreateManyInput[] = [], itemRows: Prisma.OrderItemCreateManyInput[] = [], payRows: Prisma.PaymentCreateManyInput[] = [];
  let ordN = 100201, payN = 700301;
  const trafficStores = stores.filter((x) => x.status === "ACTIVE" || x.status === "SUSPENDED");
  const sellerStatus = new Map(sellers.map((x) => [x.id, x.status]));
  const methods = [["CARD", 52], ["UPI", 16], ["WALLET", 12], ["NET_BANKING", 8], ["BANK_TRANSFER", 4], ["COD", 8]] as const;
  const gateway: Record<string, string> = { CARD: "stripe", UPI: "razorpay", WALLET: "paypal", NET_BANKING: "razorpay", BANK_TRANSFER: "manual", COD: "manual" };

  for (const st of trafficStores) {
    const ageDays = Math.max(3, Math.floor((NOW - st.created.getTime()) / DAY));
    const volume = st.status === "SUSPENDED" ? int(2, 8) : Math.min(120, Math.floor(ageDays / 4) + int(2, 15));
    const nCust = Math.max(3, Math.min(30, Math.floor(volume * 0.6)));
    const custIds: { id: string; created: Date }[] = [];
    const emails = new Set<string>();
    for (let i = 0; i < nCust; i++) {
      const f = pick(FIRST), l = pick(LAST);
      let email = `${f}.${l}${int(1, 99)}@${pick(["gmail.com", "outlook.com", "yahoo.com", "proton.me", "icloud.com"])}`.toLowerCase();
      if (emails.has(email)) continue; emails.add(email);
      const created = new Date(st.created.getTime() + Math.floor(rnd() * (NOW - st.created.getTime())));
      const cid = id(); custIds.push({ id: cid, created });
      custRows.push({ id: cid, storeId: st.id, name: `${f} ${l}`, email, phone: chance(0.8) ? `+${int(1, 91)} ${int(200, 999)} ${int(100, 999)} ${int(1000, 9999)}` : null, status: chance(0.03) ? "BLOCKED" : "ACTIVE", createdAt: created, updatedAt: created });
    }
    const catalogue = PRODUCTS[st.cat];
    for (let i = 0; i < volume; i++) {
      const cust = pick(custIds);
      const placed = i < 2 && st.status === "ACTIVE" && chance(0.6) ? ago(rnd() * 0.9) : new Date(Math.max(cust.created.getTime(), NOW - recentDays(ageDays) * DAY - int(0, 80000) * 1000));
      const lines = int(1, 3);
      let subtotal = 0; const oid = id();
      for (let k = 0; k < lines; k++) { const [pn, price] = pick(catalogue); const qty = int(1, 3); subtotal += price * qty; itemRows.push({ id: id(), orderId: oid, name: pn, sku: `${slugify(pn).slice(0, 8).toUpperCase()}-${int(100, 999)}`, quantity: qty, unitPrice: price }); }
      const shipping = st.cat === "digital-products" ? 0 : subtotal > 75 ? 0 : money(int(4, 9)), tax = money(subtotal * 0.07), amount = money(subtotal + shipping + tax);
      const ageOfOrder = (NOW - placed.getTime()) / DAY;
      let status = ageOfOrder < 1 ? weighted([["PENDING", 3], ["CONFIRMED", 3], ["PROCESSING", 2]] as const) : ageOfOrder < 4 ? weighted([["CONFIRMED", 2], ["PROCESSING", 3], ["SHIPPED", 3], ["DELIVERED", 1], ["CANCELLED", 0.6]] as const) : weighted([["DELIVERED", 14], ["SHIPPED", 1], ["CANCELLED", 1.2], ["REFUNDED", 0.9], ["PENDING", 0.3]] as const);
      const method = weighted(methods as unknown as readonly (readonly [string, number])[]) as "CARD" | "UPI" | "WALLET" | "NET_BANKING" | "BANK_TRANSFER" | "COD";
      let pay: "PAID" | "PENDING" | "FAILED" | "REFUNDED" = status === "REFUNDED" ? "REFUNDED" : status === "CANCELLED" ? weighted([["FAILED", 2], ["PENDING", 1], ["REFUNDED", 1]] as const) : status === "PENDING" ? weighted([["PENDING", 3], ["FAILED", 1]] as const) : method === "COD" && status !== "DELIVERED" ? "PENDING" : "PAID";
      orderRows.push({ id: oid, number: `#${ordN++}`, storeId: st.id, customerId: cust.id, subtotal: money(subtotal), shipping, tax, amount, status, paymentStatus: pay, placedAt: placed, createdAt: placed, updatedAt: placed });
      if (pay === "FAILED" && chance(0.4)) { // failed attempt then retry
        payRows.push({ id: id(), code: `PAY-${payN++}`, orderId: oid, amount, method, status: "FAILED", gateway: gateway[method], transactionRef: `txn_${randomUUID().replace(/-/g, "").slice(0, 18)}`, failureReason: pick(["Card declined by issuer", "Insufficient funds", "3-D Secure authentication failed", "Gateway timeout"]), createdAt: placed, updatedAt: placed });
      } else {
        payRows.push({ id: id(), code: `PAY-${payN++}`, orderId: oid, amount, method, status: pay, gateway: gateway[method], transactionRef: pay === "PENDING" && method === "COD" ? null : `txn_${randomUUID().replace(/-/g, "").slice(0, 18)}`, failureReason: pay === "FAILED" ? pick(["Card declined by issuer", "Insufficient funds", "3-D Secure authentication failed"]) : null, createdAt: placed, updatedAt: placed });
      }
    }
  }
  for (const c of chunk(custRows)) await db.customer.createMany({ data: c });
  for (const c of chunk(orderRows)) await db.order.createMany({ data: c });
  for (const c of chunk(itemRows)) await db.orderItem.createMany({ data: c });
  for (const c of chunk(payRows)) await db.payment.createMany({ data: c });

  // ───────── payouts ─────────
  const paidBySeller = new Map<string, number>();
  const storeSeller = new Map(stores.map((x) => [x.id, x.sellerId]));
  for (const o of orderRows) if (o.paymentStatus === "PAID") { const sid = storeSeller.get(o.storeId)!; paidBySeller.set(sid, (paidBySeller.get(sid) ?? 0) + Number(o.amount)); }
  const payoutRows: Prisma.PayoutCreateManyInput[] = []; let poN = 3001;
  for (const sl of sellers) {
    const total = paidBySeller.get(sl.id) ?? 0; if (total < 120 || sl.status === "BLOCKED") continue;
    const rate = sl.planKey === "free" ? 0.07 : sl.planKey === "starter" ? 0.05 : sl.planKey === "growth" ? 0.035 : 0.02;
    const n = Math.min(4, Math.max(1, Math.floor(total / 800)));
    const store = stores.find((x) => x.sellerId === sl.id);
    for (let k = 0; k < n; k++) {
      const gross = money((total / (n + 0.6)) * (0.8 + rnd() * 0.4)); const commission = money(gross * rate); const net = money(gross - commission);
      const requested = ago(k === 0 ? int(0, 9) : k * 9 + int(2, 10));
      const status = k === 0 ? weighted([["PENDING", 5], ["PROCESSING", 2], ["COMPLETED", 3], ["FAILED", 0.7]] as const) : weighted([["COMPLETED", 12], ["FAILED", 0.6]] as const);
      const approved = status === "PENDING" ? (chance(0.4) ? new Date(requested.getTime() + 3600_000 * int(2, 20)) : null) : new Date(requested.getTime() + 3600_000 * int(2, 20));
      const processed = status === "PENDING" ? null : new Date((approved ?? requested).getTime() + 3600_000 * int(2, 30));
      payoutRows.push({ id: id(), code: `PO-${poN++}`, sellerId: sl.id, storeId: store?.id, grossAmount: gross, commission, netAmount: net, status, approvedAt: approved, approvedById: approved ? adminOf("finance_admin").id : null, requestedAt: requested, processedAt: processed, completedAt: status === "COMPLETED" ? new Date(processed!.getTime() + 3600_000 * int(4, 40)) : null, failureReason: status === "FAILED" ? pick(["Bank account details rejected", "Beneficiary account closed", "Transfer returned by bank"]) : null, reference: status === "COMPLETED" ? `BNK${int(10000000, 99999999)}` : null, createdAt: requested, updatedAt: requested });
    }
  }
  await db.payout.createMany({ data: payoutRows });

  // ───────── domains ─────────
  const domainRows: Prisma.DomainCreateManyInput[] = [];
  const base = process.env.STOREFRONT_BASE_DOMAIN ?? "storelaunch.app";
  for (const st of stores) {
    domainRows.push({ id: id(), storeId: st.id, hostname: `${st.slug}.${base}`, type: "SUBDOMAIN", status: st.status === "DISABLED" ? "DISABLED" : "VERIFIED", sslStatus: "ACTIVE", verifiedAt: st.created, createdAt: st.created, updatedAt: st.created });
    const owner = sellers.find((x) => x.id === st.sellerId)!;
    if (["growth", "pro"].includes(owner.planKey) && chance(0.55)) {
      const status = weighted([["VERIFIED", 7], ["PENDING", 2], ["VERIFYING", 1.5], ["FAILED", 1.5], ["DISABLED", 0.5]] as const);
      domainRows.push({ id: id(), storeId: st.id, hostname: `shop.${st.slug.replace(/-/g, "")}.${pick(["com", "co", "shop", "store"])}`, type: "CUSTOM", status, sslStatus: status === "VERIFIED" ? "ACTIVE" : status === "FAILED" ? "FAILED" : "PENDING", verificationToken: `sl-verify-${randomUUID().slice(0, 12)}`, verifiedAt: status === "VERIFIED" ? new Date(st.created.getTime() + 3 * DAY) : null, createdAt: new Date(st.created.getTime() + 2 * DAY), updatedAt: ago(int(0, 20)) });
    }
  }
  await db.domain.createMany({ data: domainRows });

  // ───────── support tickets ─────────
  const subjects: [string, string, string][] = [
    ["Custom domain stuck on verifying", "Domains", "I added my CNAME record 2 days ago but verification still shows pending. Can you check?"],
    ["Payout hasn't arrived", "Payouts", "My last payout was marked completed but the money hasn't reached my bank account."],
    ["How do I change my plan billing cycle?", "Billing", "I'd like to switch from monthly to yearly billing. Is it prorated?"],
    ["Theme preview not loading", "Themes", "The Runway theme preview shows a blank page on mobile."],
    ["Charged twice this month", "Billing", "I see two subscription charges on my card statement for the same month."],
    ["Request to increase product limit", "Plans", "We're about to hit our product limit and need a temporary increase."],
    ["SSL certificate shows as invalid", "Domains", "Visitors see a certificate warning on our custom domain."],
    ["Account suspended — need help", "Account", "My account was suspended and I don't know why. Please advise."],
    ["Commission rate question", "Payouts", "Why is the commission on my payout higher than I expected?"],
    ["Orders not syncing to dashboard", "Orders", "Some orders from yesterday are missing from my order list."],
    ["Can I move my store to another seller account?", "Account", "We restructured our business and want to transfer the store."],
    ["Feature request: bulk theme switch", "Themes", "It would be great to switch themes across multiple stores at once."],
  ];
  const ticketRows: Prisma.SupportTicketCreateManyInput[] = [], msgRows: Prisma.SupportMessageCreateManyInput[] = [];
  const supportAdmins = [adminOf("support_admin"), staffUsers.find((u) => u.email === "support2@storelaunch.test")!, adminOf("admin")];
  const engaged = sellers.filter((x) => x.status !== "REJECTED");
  for (let i = 0; i < 38; i++) {
    const sl = pick(engaged); const [subject, category, body] = pick(subjects);
    const created = ago(recentDays(60)); const st = stores.find((x) => x.sellerId === sl.id);
    const status = weighted([["OPEN", 7], ["IN_PROGRESS", 6], ["WAITING", 3], ["RESOLVED", 6], ["CLOSED", 4]] as const);
    const priority = category === "Billing" || category === "Payouts" ? weighted([["MEDIUM", 3], ["HIGH", 3], ["URGENT", 1.2]] as const) : weighted([["LOW", 4], ["MEDIUM", 5], ["HIGH", 2], ["URGENT", 0.5]] as const);
    const assigned = status === "OPEN" && chance(0.5) ? null : pick(supportAdmins);
    const updated = status === "OPEN" ? created : new Date(created.getTime() + int(1, 40) * 3600_000);
    const tid = id();
    ticketRows.push({ id: tid, code: `TKT-${2001 + i}`, sellerId: sl.id, storeId: st?.id, subject, category, priority, status, assignedToId: assigned?.id, resolvedAt: status === "RESOLVED" || status === "CLOSED" ? updated : null, createdAt: created, updatedAt: updated });
    msgRows.push({ id: id(), ticketId: tid, authorType: "SELLER", authorName: sl.name, body, isInternal: false, createdAt: created });
    if (assigned && status !== "OPEN") {
      msgRows.push({ id: id(), ticketId: tid, authorType: "ADMIN", authorId: assigned.id, authorName: staff.find((x) => x[1] === assigned.email)?.[0] ?? "Platform Owner", body: "Thanks for reaching out — I'm looking into this now and will update you shortly.", isInternal: false, createdAt: new Date(created.getTime() + 1800_000) });
      if (chance(0.6)) msgRows.push({ id: id(), ticketId: tid, authorType: "ADMIN", authorId: assigned.id, authorName: staff.find((x) => x[1] === assigned.email)?.[0] ?? "Platform Owner", body: pick(["Checked the logs; escalated to engineering for a closer look.", "Customer is on a legacy plan — double-check entitlements before changing anything.", "Verified with finance: the transfer left our side, waiting on the receiving bank."]), isInternal: true, createdAt: new Date(created.getTime() + 3600_000 * 3) });
      if (status === "RESOLVED" || status === "CLOSED") msgRows.push({ id: id(), ticketId: tid, authorType: "ADMIN", authorId: assigned.id, authorName: staff.find((x) => x[1] === assigned.email)?.[0] ?? "Platform Owner", body: "This should be sorted now. Let us know if anything still looks off — happy to help.", isInternal: false, createdAt: updated });
    }
  }
  await db.supportTicket.createMany({ data: ticketRows });
  await db.supportMessage.createMany({ data: msgRows });

  // ───────── admin activity (audit log) ─────────
  const audit: Prisma.AuditLogCreateManyInput[] = [];
  const ips = ["203.0.113.24", "198.51.100.77", "192.0.2.15", "203.0.113.99"]; const uas = ["Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) Chrome/126.0", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/127.0", "Mozilla/5.0 (X11; Linux x86_64) Chrome/125.0"];
  const log = (actor: { id: string; email: string }, action: string, targetType: string, targetId: string | undefined, description: string, days: number, metadata?: Prisma.InputJsonValue) =>
    audit.push({ id: id(), actorId: actor.id, actorEmail: actor.email, action, targetType, targetId, description, metadata, ip: pick(ips), userAgent: pick(uas), createdAt: ago(days) });
  const adm = adminOf("admin"), fin = adminOf("finance_admin"), sup = adminOf("support_admin"), thm = adminOf("theme_manager"), own = { id: owner.id, email: owner.email };
  for (let d = 0; d < 28; d++) for (const u of [own, adm, sup, fin, thm].filter(() => chance(0.4))) log(u, "auth.login", "User", u.id, `${u.email} signed in`, d + rnd() * 0.8);
  for (const sl of sellers.filter((x) => x.status === "ACTIVE").slice(0, 12)) log(chance(0.5) ? adm : own, "seller.approved", "Seller", sl.id, `Approved seller ${sl.name}`, recentDays(50) + 1);
  for (const sl of sellers.filter((x) => x.status === "REJECTED")) log(adm, "seller.rejected", "Seller", sl.id, `Rejected seller ${sl.name} — application could not be verified`, int(4, 30));
  for (const sl of sellers.filter((x) => x.status === "SUSPENDED")) log(adm, "seller.suspended", "Seller", sl.id, `Suspended seller ${sl.name} — ${pick(["repeated customer complaints", "identity re-verification pending"])}`, int(3, 25));
  for (const sl of sellers.filter((x) => x.status === "BLOCKED")) log(own, "seller.blocked", "Seller", sl.id, `Blocked seller ${sl.name} — confirmed fraudulent activity`, int(5, 40));
  for (const t of themes.filter((x) => x.pubStatus === "PUBLISHED").slice(0, 6)) log(thm, "theme.published", "Theme", t.id, `Published theme ${themeDefs.find((d) => slugify(d[0]) === slugify(String(t.id)))?.[0] ?? "theme"}`, int(2, 45));
  for (const po of payoutRows.filter((p) => p.status === "COMPLETED").slice(0, 8)) log(fin, "payout.completed", "Payout", po.id, `Marked payout ${po.code} completed`, int(1, 25));
  for (const po of payoutRows.filter((p) => p.approvedAt && p.status === "PENDING").slice(0, 3)) log(fin, "payout.approved", "Payout", po.id, `Approved payout ${po.code}`, int(0, 2));
  log(own, "plan.updated", "Plan", plan("growth").id, "Updated plan Growth (monthlyPrice: 45 → 49)", 21); log(own, "settings.updated", "PlatformSetting", "commission", "Updated Commission settings", 14); log(own, "user.created", "User", staffUsers[0]!.id, "Created admin user admin@storelaunch.test with Admin", 60); log(own, "role.permissions_changed", "Role", roles.get("support_admin"), "Updated role Support Admin: +1 / −0 permissions", 33);
  log(adm, "subscription.cancelled", "Subscription", subRows.find((x) => x.status === "CANCELLED")?.id, "Cancelled a subscription — seller requested closure", 9);
  for (const t of ticketRows.filter((x) => x.status === "RESOLVED").slice(0, 5)) log(sup, "ticket.resolved", "SupportTicket", t.id, `${t.code} resolved`, int(0, 12));
  for (const c of chunk(audit)) await db.auditLog.createMany({ data: c });

  // keep seller "last activity" consistent with most recent order for active sellers
  console.log(`Demo data created: ${sellers.length} sellers, ${stores.length} stores, ${themes.length} themes, ${subRows.length} subscriptions, ${custRows.length} customers, ${orderRows.length} orders, ${payRows.length} payments, ${payoutRows.length} payouts, ${domainRows.length} domains, ${ticketRows.length} tickets, ${audit.length} audit entries.`);
  console.log("Demo logins (password: " + (process.env.DEMO_ADMIN_PASSWORD ?? "Demo!Passw0rd12") + "): admin@, support@, finance@, themes@storelaunch.test — plus the bootstrap Super Admin.");
}

main().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
