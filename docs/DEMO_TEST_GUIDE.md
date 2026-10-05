# Demo test guide — try every feature

Setup: see README (`db:seed` + `db:seed:demo`). Password for staff accounts: `Demo!Passw0rd12`.
Super Admin: `owner@storelaunch.test` / the `BOOTSTRAP_ADMIN_PASSWORD` from your `.env`.
Tip: test destructive actions on the demo data freely; `npm run db:reset:demo` restores everything.

| Login | Role | What to expect |
|---|---|---|
| owner@ | Super Admin | All 16 sections |
| admin@ | Admin | No payouts actions, no user/settings changes |
| support@ | Support Admin | Sellers/Stores/Orders (view), Support (manage); no payments/payouts |
| finance@ | Finance Admin | Payments, Payouts (manage), Analytics; settings → "Access denied" |
| themes@ | Theme Manager | Only Overview, Stores (view), Themes |

## 1. Sign-in & security (any user)
- Wrong password → generic "Invalid email or password." (check **Audit Logs** as owner: `auth.login_failed`).
- 5 wrong attempts on one account → "Account temporarily locked" (limit configurable in Settings → Security).
- Open `/sellers` while signed out → redirected to `/login`.
- As themes@, open `/sellers`, `/payouts`, `/settings` by URL → "You don't have access" page (server-enforced).
- Sign out from the avatar menu → `auth.logout` in Audit Logs.

## 2. Overview (owner)
- 10 KPI cards; click a card to jump to the filtered list. Switch **Today / 7 Days / 30 Days / 90 Days / 1 Year** — charts re-query the DB.
- Bell icon: live counts of pending sellers, urgent tickets, pending payouts, failed domains.
- Recent sellers / stores / orders / tickets / admin activity lists.

## 3. Sellers (owner or admin)
- Search by name, email, `SLR-1001` or store name; filter Status/Plan; sort by clicking headers; paginate.
- Row menu **…** on a *Pending* seller: **Approve** (confirm) or **Reject** (reason required — try submitting empty).
- On an *Active* seller: **Suspend** (also suspends their stores — check Stores), **Block**, **Change plan**. On a Suspended/Blocked one: **Reactivate**.
- Open a seller → tabs Overview · Stores · Subscription · Orders · Revenue (chart) · Activity (shows the actions you just did).

## 4. Stores
- Filter by status/category/theme. **Suspend** / **Disable** (reason) / **Activate** (blocked if the owner isn't active — try it on a suspended seller's store).
- Open a store: stats, selected theme, domains, 6-month sales chart, **Open store preview** link.

## 5. Plans & Pricing
- **Create plan** (name, prices, trial days, limits — blank = unlimited, feature checkboxes + custom feature keys). **Edit**, **Deactivate/Activate** (the last active plan can't be deactivated).

## 6. Subscriptions
- Filter status/plan/billing cycle. **Change plan** (amount recalculated), **Cancel** (reason), **Reactivate**. Open one for billing history.

## 7. Themes (owner, admin or themes@)
- **Create theme** (draft) → **Publish** (needs preview image + description) → **Mark as featured** → **Unpublish** / **Deactivate** (confirmations). Edit metadata/version via **Edit metadata**.

## 8. Orders · Customers · Payments (read-only, admin/owner/finance)
- Orders: filter by store, seller, payment status, order status; open an order for items, totals and transactions.
- Customers: search; open a profile for order history and store.
- Payments: totals strip, filters, **Inspect** drawer shows the transaction reference (no secrets).

## 9. Payouts (finance@ or owner)
- Pending payout → **Approve** → **Process** → **Mark completed** (optional bank reference). Another one → **Mark failed** (reason).
- As admin@ the same page is view-only (no actions).

## 10. Domains
- Filter by verification/type/SSL. **Mark as verified**, **Retry verification**, **Disable**, **Re-enable**.

## 11. Support (support@ or owner)
- Open a ticket: **Assign**, **Change priority**, **Change status**, **Add note / reply** (tick *Internal note* — shown in amber), **Resolve**.

## 12. Users & Roles (owner)
- **Add admin user** (try a weak password → rejected), **Edit roles**, **Reset password**, **Disable** (you can't disable yourself or the last Super Admin).
- Roles tab: **Create role** with granular permissions; edit a role then sign in as a user with it to see navigation change immediately.

## 13. Analytics (owner/admin/finance)
- Date filters; revenue, GMV, orders, sellers, stores, customers, subscription growth, growth trends, plan distribution, orders by status, top stores.

## 14. Audit Logs (owner/admin)
- Filter by period, action prefix, actor, target type; search; **Details** drawer shows IP, user agent and metadata (before/after).
- Immutability: `UPDATE "AuditLog" ...` in psql fails with "AuditLog is append-only".

## 15. Settings (owner)
- General, Branding, Email, Payment, Commission, Notifications, Security, Maintenance. Try invalid values (e.g. 99% commission) → validation error.
- Payment/Email show only whether credentials are configured in env — never the values.

## 16. Responsive
- Narrow the browser below 768px: tables become cards; below 1024px the sidebar becomes a hamburger menu. Desktop sidebar collapses.

## Automated walkthrough
`e2e/full-walkthrough.mjs` performs most of the above through the real UI and verifies results in the database (see header comment for usage; run it on a fresh demo DB).
