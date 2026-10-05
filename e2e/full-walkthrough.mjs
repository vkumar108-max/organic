import { chromium } from "playwright-core";
import { execSync, execFileSync } from "child_process";
// Usage: BASE=http://localhost:3000 DB=postgresql://... node e2e/full-walkthrough.mjs  (needs `npm i -D playwright-core`, a fresh demo DB and a running app)
const base = process.env.BASE ?? "http://localhost:3000";
const DB = process.env.DB ?? process.env.DATABASE_URL.split("?")[0];
const q = (sql) => execFileSync("psql", [DB, "-tAc", sql]).toString().trim();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ["--no-sandbox"] });
const results = [];
const ok = (name, pass, extra = "") => { results.push(pass); console.log(pass ? "PASS" : "FAIL", name, extra); };
async function login(email, pw) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
  await page.goto(base + "/login"); await page.fill("#email", email); await page.fill("#password", pw);
  await Promise.all([page.waitForURL(base + "/"), page.click("button[type=submit]")]); return page;
}
// open row menu on first row of list url, pick item, optionally fill fields, click dialog button
async function act(page, url, item, { fill = {}, select = {}, btn, row = 0, toast } = {}) {
  await page.goto(base + url); await page.waitForSelector("tbody tr");
  await page.locator("tbody tr").nth(row).getByRole("button", { name: "Actions" }).click();
  await page.getByRole("menuitem", { name: item }).click();
  const d = page.getByRole("dialog");
  for (const [k, v] of Object.entries(fill)) await d.locator(`#f-${k}`).fill(v);
  for (const [k, v] of Object.entries(select)) await d.locator(`#f-${k}`).selectOption(v);
  if (btn) await d.getByRole("button", { name: btn, exact: true }).last().click();
  if (toast) await page.getByText(toast).first().waitFor({ timeout: 8000 });
}
const PW = "Demo!Passw0rd12";
let o = await login("owner@storelaunch.test", "ChangeMe!12345");

// Sellers: suspend, reactivate, block, reject
const sid = q(`select id from "Seller" where status='ACTIVE' order by "createdAt" desc offset 5 limit 1`);
await o.goto(base + `/sellers?q=${q(`select code from "Seller" where id='${sid}'`)}`);
await act(o, `/sellers?q=${q(`select code from "Seller" where id='${sid}'`)}`, "Suspend seller", { fill: { reason: "demo suspend" }, btn: "Suspend", toast: "Seller suspended" });
ok("seller suspend", q(`select status from "Seller" where id='${sid}'`) === "SUSPENDED");
ok("suspend cascades to stores", q(`select count(*) from "Store" where "sellerId"='${sid}' and status='ACTIVE'`) === "0");
await act(o, `/sellers?q=${q(`select code from "Seller" where id='${sid}'`)}`, "Reactivate seller", { btn: "Reactivate", toast: "Seller reactivated" });
ok("seller reactivate", q(`select status from "Seller" where id='${sid}'`) === "ACTIVE");
await act(o, `/sellers?q=${q(`select code from "Seller" where id='${sid}'`)}`, "Block seller", { fill: { reason: "demo block" }, btn: "Block seller", toast: "Seller blocked" });
ok("seller block", q(`select status from "Seller" where id='${sid}'`) === "BLOCKED");
await act(o, `/sellers?status=PENDING`, "Reject seller", { fill: { reason: "demo reject" }, btn: "Reject seller", toast: "Seller rejected" });
ok("seller reject", Number(q(`select count(*) from "Seller" where status='REJECTED' and "statusReason"='demo reject'`)) === 1);
// change plan
const pid = q(`select id from "Plan" where key='pro'`);
await act(o, `/sellers?status=ACTIVE`, "Change plan", { select: { planId: pid }, btn: "Change plan", toast: "Plan updated" });
ok("seller change plan", Number(q(`select count(*) from "AuditLog" where action='plan.seller_changed'`)) === 1);
// Stores
await act(o, `/stores?status=ACTIVE`, "Suspend store", { fill: { reason: "demo" }, btn: "Suspend", toast: "Store suspended" });
ok("store suspend", Number(q(`select count(*) from "AuditLog" where action='store.suspended'`)) === 1);
await act(o, `/stores?status=SUSPENDED&q=`, "Activate store", { btn: "Activate", toast: /Store activated|can only go live/ });
// Plans edit + deactivate/activate
await o.goto(base + "/plans"); await o.getByRole("button", { name: "Edit plan" }).first().click();
await o.locator("#f-description").fill("Edited in demo"); await o.getByRole("dialog").getByRole("button", { name: "Save changes" }).click(); await o.getByText("Plan updated.").waitFor();
ok("plan edit", q(`select description from "Plan" where key='free'`) === "Edited in demo");
await o.getByRole("button", { name: "Deactivate", exact: true }).last().click(); await o.getByRole("dialog").getByRole("button", { name: "Deactivate" }).click(); await o.getByText(/Plan deactivated/).waitFor();
ok("plan deactivate", q(`select count(*) from "Plan" where "isActive"=false`) === "1");
await o.getByRole("button", { name: "Activate", exact: true }).first().click(); await o.getByRole("dialog").getByRole("button", { name: "Activate" }).click(); await o.getByText("Plan activated.").waitFor();
// Subscriptions
await act(o, `/subscriptions?status=ACTIVE`, "Cancel subscription", { fill: { reason: "demo cancel" }, btn: "Cancel subscription", toast: "Subscription cancelled" });
ok("subscription cancel", q(`select count(*) from "Subscription" where "cancelReason"='demo cancel'`) === "1");
await act(o, `/subscriptions?q=${q(`select code from "Subscription" where "cancelReason"='demo cancel'`)}`, "Reactivate subscription", { btn: "Reactivate", toast: /Subscription reactivated|isn't active|inactive/ });
await act(o, `/subscriptions?status=ACTIVE`, "Change plan", { select: { billingCycle: "YEARLY" }, btn: "Change plan", toast: "Subscription updated" });
ok("subscription change plan", Number(q(`select count(*) from "AuditLog" where action='subscription.plan_changed'`)) === 1);
// Themes
await o.goto(base + "/themes"); await o.getByRole("button", { name: "Create theme" }).click();
await o.fill("#f-name", "Demo Theme"); await o.fill("#f-description", "Demo description"); await o.fill("#f-previewImageUrl", "/theme-previews/fashion.svg");
await o.getByRole("dialog").getByRole("button", { name: "Create theme" }).click(); await o.getByText(/created as a draft/).waitFor();
ok("theme create", q(`select status from "Theme" where slug='demo-theme'`) === "DRAFT");
await act(o, `/themes?q=Demo+Theme`, "Publish theme", { btn: "Publish", toast: "Theme published" });
ok("theme publish", q(`select status from "Theme" where slug='demo-theme'`) === "PUBLISHED");
await act(o, `/themes?q=Demo+Theme`, "Mark as featured", { toast: "Theme featured" });
ok("theme feature", q(`select "isFeatured" from "Theme" where slug='demo-theme'`) === "t");
await act(o, `/themes?q=Demo+Theme`, "Unpublish theme", { btn: "Unpublish", toast: "Theme unpublished" });
await act(o, `/themes?q=Demo+Theme`, "Deactivate theme", { btn: "Deactivate", toast: "Theme deactivated" });
ok("theme unpublish+deactivate", q(`select status||'/'||"isActive" from "Theme" where slug='demo-theme'`) === "UNPUBLISHED/f");
// Domains
await act(o, `/domains?status=FAILED`, "Mark as verified", { btn: "Mark verified", toast: "Domain marked as verified" });
ok("domain verify", Number(q(`select count(*) from "AuditLog" where action='domain.verified'`)) === 1);
await act(o, `/domains?status=VERIFIED&type=CUSTOM`, "Disable domain", { btn: "Disable", toast: "Domain disabled" });
await act(o, `/domains?status=DISABLED`, "Re-enable domain", { toast: /re-enabled/ });
// Support
let ticket = q(`select code from "SupportTicket" where status='OPEN' order by "createdAt" desc limit 1`);
await act(o, `/support?q=${ticket}`, "Assign", { select: { assigneeId: q(`select id from "User" where email='support@storelaunch.test'`) }, btn: "Assign", toast: "Ticket assigned" });
ok("ticket assign", q(`select count(*) from "SupportTicket" where code='${ticket}' and "assignedToId" is not null`) === "1");
await act(o, `/support?q=${ticket}`, "Change priority", { select: { priority: "URGENT" }, btn: "Update", toast: "Priority updated" });
await act(o, `/support?q=${ticket}`, "Change status", { select: { status: "WAITING" }, btn: "Update", toast: "Status updated" });
ok("ticket priority+status", q(`select priority||'/'||status from "SupportTicket" where code='${ticket}'`) === "URGENT/WAITING");
await o.goto(base + `/support?q=${ticket}`); await o.locator("tbody a").first().click(); await o.waitForURL(/support\/.+/);
await o.getByRole("button", { name: "Add note / reply" }).click(); await o.fill("#f-body", "Internal demo note"); await o.getByRole("dialog").getByRole("button", { name: "Post" }).click(); await o.getByText("Message added.").waitFor();
ok("ticket internal note", q(`select count(*) from "SupportMessage" where body='Internal demo note' and "isInternal"=true`) === "1");
await o.getByRole("button", { name: "Resolve ticket" }).click(); await o.getByRole("dialog").getByRole("button", { name: "Resolve" }).click(); await o.getByText("Ticket resolved.").waitFor();
ok("ticket resolve", q(`select status from "SupportTicket" where code='${ticket}'`) === "RESOLVED");
// Users & roles
await o.goto(base + "/users"); await o.getByRole("button", { name: "Add admin user" }).click();
await o.fill("#f-name", "Demo Staff"); await o.fill("#f-email", "demo.staff@storelaunch.test"); await o.fill("#f-password", "weak");
await o.getByRole("dialog").getByRole("checkbox").first().check(); await o.getByRole("dialog").getByRole("button", { name: "Create user" }).click();
ok("weak password rejected", await o.getByText(/at least 12 characters/).first().isVisible());
await o.fill("#f-password", "StrongPass!2026"); await o.getByRole("dialog").getByRole("button", { name: "Create user" }).click(); await o.getByText(/created\./).first().waitFor();
ok("user create", q(`select count(*) from "User" where email='demo.staff@storelaunch.test'`) === "1");
await o.reload(); await o.waitForSelector("tbody tr");
const staffRow = o.locator("tbody tr", { hasText: "demo.staff@" });
await staffRow.getByRole("button", { name: "Actions" }).click(); await o.getByRole("menuitem", { name: "Disable user" }).click(); await o.getByRole("dialog").getByRole("button", { name: "Disable user" }).click(); await o.getByText(/User disabled/).waitFor();
ok("user disable", q(`select status from "User" where email='demo.staff@storelaunch.test'`) === "DISABLED");
// self-protection: owner can't disable self (menu item hidden)
await o.reload(); await o.locator("tbody tr", { hasText: "owner@" }).getByRole("button", { name: "Actions" }).click();
ok("cannot disable self (no menu item)", (await o.getByRole("menuitem", { name: "Disable user" }).count()) === 0); await o.keyboard.press("Escape");
await o.goto(base + "/users?tab=roles"); await o.getByRole("button", { name: "Create role" }).click(); await o.fill("#f-name", "Auditor");
await o.getByRole("dialog").getByText("Audit: View audit logs").click(); await o.getByRole("dialog").getByRole("button", { name: "Create role" }).click(); await o.getByText(/Role .Auditor. created/).waitFor();
ok("role create", q(`select count(*) from "RolePermission" rp join "Role" r on r.id=rp."roleId" where r.key='auditor'`) === "1");
// Settings
await o.goto(base + "/settings?section=commission"); await o.waitForSelector("#s-defaultRatePercent"); await o.fill("#s-defaultRatePercent", "99"); await o.getByRole("button", { name: "Save changes" }).click();
await o.getByText(/must be|less than|too big/i).first().waitFor({ timeout: 5000 }).catch(() => {});
ok("settings validation (99% rejected)", q(`select value->>'defaultRatePercent' from "PlatformSetting" where key='commission'`) !== "99");
await o.fill("#s-defaultRatePercent", "6"); await o.getByRole("button", { name: "Save changes" }).click(); await o.getByText(/Commission settings saved/).waitFor();
ok("settings save", q(`select value->>'defaultRatePercent' from "PlatformSetting" where key='commission'`) === "6");
// Payouts (finance)
const f = await login("finance@storelaunch.test", PW);
const po = q(`select code from "Payout" where status='PENDING' and "approvedAt" is null and "sellerId" in (select id from "Seller" where status='ACTIVE') limit 1`);
await act(f, `/payouts?q=${po}`, "Approve payout", { btn: "Approve", toast: "Payout approved" });
await act(f, `/payouts?q=${po}`, "Process payout", { btn: "Start processing", toast: "Payout moved to processing" });
await act(f, `/payouts?q=${po}`, "Mark completed", { fill: { reference: "BNK-DEMO-1" }, btn: "Mark completed", toast: "marked as completed" });
ok("payout approve→process→complete", q(`select status||'/'||reference from "Payout" where code='${po}'`) === "COMPLETED/BNK-DEMO-1");
const po2 = q(`select code from "Payout" where status='PENDING' and "approvedAt" is null limit 1`);
await act(f, `/payouts?q=${po2}`, "Mark failed", { fill: { reason: "demo fail" }, btn: "Mark failed", toast: "marked as failed" });
ok("payout fail", q(`select status from "Payout" where code='${po2}'`) === "FAILED");
// RBAC: finance cannot see settings write / support can't approve payouts (no payouts access)
await f.goto(base + "/settings"); await f.waitForLoadState("networkidle"); ok("finance blocked from settings", f.url().endsWith("/forbidden"));
// audit completeness + immutability
ok("audit entries recorded", Number(q(`select count(*) from "AuditLog" where action like 'payout.%' or action like 'theme.%' or action like 'user.%' or action like 'settings.%'`)) >= 10);
let blocked = false; try { execFileSync("psql", [DB, "-c", "update \"AuditLog\" set description='x'"], { stdio: "pipe" }); } catch (e) { blocked = /append-only/.test(String(e.stderr || e.stdout)); }
ok("audit log UPDATE blocked by DB trigger", blocked);
// Login failure + logout audit
const ctx = await browser.newContext(); const p = await ctx.newPage(); await p.goto(base + "/login"); await p.fill("#email", "owner@storelaunch.test"); await p.fill("#password", "wrong"); await p.click("button[type=submit]"); await p.getByText("Invalid email or password.").waitFor();
ok("bad login generic error + audited", Number(q(`select count(*) from "AuditLog" where action='auth.login_failed'`)) >= 1);
await o.getByRole("button", { name: "Account" }).click(); await o.getByRole("menuitem", { name: "Sign out" }).click(); await o.waitForURL(/login/);
ok("logout", Number(q(`select count(*) from "AuditLog" where action='auth.logout'`)) >= 1);
console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
await browser.close();
