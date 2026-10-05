# STORELAUNCH — Super Admin Panel (Part 1) Architecture

Scope: the private control center for the platform owner. The Seller Dashboard / Store Builder
and the Customer Storefront are **not** part of this codebase; they will share the same
PostgreSQL database (via the Prisma schema) or a future shared API.

## 1. Architecture overview

- **Next.js 15 (App Router) + TypeScript + Tailwind CSS**, server-first. Pages are React Server
  Components that query the database through `src/server/*/queries.ts`. Interactivity (menus,
  dialogs, filters, charts) is isolated in small client components.
- **All mutations are Server Actions** built with one factory, `createAction()`, which enforces
  (in order): authenticated session → permission → rate limit (optional) → zod validation →
  business rule → audit log → cache revalidation → safe error mapping. There is no code path that
  mutates data without passing through it.
- **PostgreSQL + Prisma**. One relational schema shared by future modules. Money is `Decimal`.
  `AuditLog` is append-only (DB trigger blocks UPDATE/DELETE).
- **Layers** (dependencies point downward only):

```
app/ (routes, RSC pages)  ->  features/ (feature UI)  ->  components/ui (design system)
          |                          |
          v                          v
   server/<feature>/{queries,actions,schemas}  ->  server/{auth,rbac,audit,db}  ->  Prisma
```

- Business rules (state machines, plan change, payout flow) live in `server/<feature>`, never
  in components.

## 2. Folder structure

```
prisma/
  schema.prisma              relational model
  migrations/                SQL migrations (+ audit-log immutability trigger)
  seed.ts                    CORE seed: permissions, roles, plans, theme categories, settings, first Super Admin
  seed-demo.ts               DEMO seed (refuses to run in production without ALLOW_DEMO_SEED=true)
src/
  app/
    login/                   public sign-in
    api/health/              liveness probe
    (admin)/                 every protected route; layout enforces session server-side
      page.tsx               Overview
      sellers/ [id]/  stores/ [id]/  plans/  subscriptions/ [id]/  themes/
      orders/ [id]/   customers/ [id]/  payments/  payouts/  domains/
      support/ [id]/  users/  analytics/  audit-logs/  settings/
  components/
    ui/                      Button, Badge, Card, Modal, Drawer, Dropdown, Tabs, Toast, Skeleton, Pagination, ...
    data/                    DataTable, FilterBar, RowActions, DetailList, SortHeader
    layout/                  Sidebar, Header, Shell, Notifications, UserMenu
    charts/                  Area/Bar/Donut chart cards + range filter
  features/<feature>/        feature-specific UI (columns, forms, panels)
  server/
    db.ts                    Prisma singleton
    auth/                    password hashing, DB-backed sessions, login/logout, guards
    rbac/                    permission checks (always from DB, per request)
    actions/create-action.ts the guarded server-action factory
    audit/                   append-only audit writer
    <feature>/               queries.ts, actions.ts, schemas.ts (zod), service logic
  config/                    nav, permissions, roles, statuses, plan feature catalog, app constants
  lib/                       format, list-params, rate-limit, env, utils
  hooks/  types/
docs/ARCHITECTURE.md
```

## 3. Database design (summary)

```
User ─< UserRole >─ Role ─< RolePermission >─ Permission
User ─< Session            User ─< AuthToken (verification / reset / 2FA — future use)
Seller ─< Store >─ Theme >─ ThemeCategory        Seller >─ Plan
Seller ─< Subscription >─ Plan ─< SubscriptionInvoice    Subscription >─ Store?
Store ─< Customer ─< Order ─< OrderItem ; Order ─< Payment
Seller/Store ─< Payout        Store ─< Domain
Seller ─< SupportTicket ─< SupportMessage (internal notes flagged) ; SupportTicket >─ User(assignee)
AuditLog (append-only, actorEmail snapshot)      PlatformSetting (key/value JSON, grouped)
```

Every table has `cuid` PK, `createdAt`/`updatedAt`, status enums, and indexes on foreign keys and
on the columns used for filtering/sorting (status, createdAt). Human-readable codes
(`SLR-1001`, `SUB-…`, `PAY-…`, `PO-…`, `TKT-…`) are unique columns.

## 4. Authentication architecture

- Email + password. Passwords hashed with bcrypt (cost 12). Generic error message on failure;
  constant-ish timing (dummy hash compare for unknown emails).
- **Opaque, DB-backed sessions**: 32 random bytes in an `httpOnly`, `SameSite=Lax`, `Secure` (in
  production), `__Host-` prefixed cookie. Only the SHA-256 hash is stored, so a DB leak cannot
  be replayed. Sessions expire (absolute + idle), can be revoked, and are re-validated on every
  request in `requireUser()`.
- Account lockout after N failed attempts + per-IP/email rate limiter (`lib/rate-limit.ts`,
  in-memory implementation behind an interface, swap for Redis).
- `middleware.ts` only does an optimistic cookie-presence redirect (UX). **Real authorization is
  server-side** in the `(admin)` layout, every page and every action.
- Future-ready: `User.emailVerifiedAt`, `User.twoFactorSecret/Enabled`, `AuthToken`
  (type: EMAIL_VERIFY | PASSWORD_RESET | TWO_FACTOR_RECOVERY), `OAuthAccount` table.
- Only users with `status = ACTIVE` and at least one role can sign in.

## 5. RBAC architecture

- Permissions are a static catalog in `config/permissions.ts` (`<area>.<view|manage>`), seeded
  to the `Permission` table. Roles (Super Admin, Admin, Support Admin, Finance Admin, Theme
  Manager) are seeded with permission sets; custom roles can be created in the UI.
- `getAuthContext()` (React `cache`d per request) loads user + roles + permissions from the DB.
  `requirePermission()` renders/returns 403; `can()` hides UI. UI hiding is cosmetic only.
- `*.manage` implies nothing automatically: view and manage are separate grants. The `super_admin`
  role is protected (cannot be edited, last super admin cannot be disabled/demoted).
- Sidebar items, dashboard widgets and row actions are each driven by permission keys.

## 6. API / server-action structure

`server/<feature>/actions.ts` exports `createAction({ permission, schema, handler })`
functions. Contract: `(input) => Promise<{ ok: true, message } | { ok: false, message, fieldErrors? }>`.
The factory writes the audit entry through `ctx.audit()`, revalidates paths, and never leaks
internals (unexpected errors are logged server-side and return a generic message).
Read access is via RSC queries (permission-checked in the page). `/api/health` is the only HTTP route.

## 7. UI component architecture

Design-system primitives in `components/ui`; composed data primitives in `components/data`:
`DataTable` (desktop table → mobile cards from the same column definitions), `FilterBar`
(URL-state search/filters/sort, so pages stay server-rendered and shareable), `Pagination`,
`RowActions` (menu → confirm dialog / form dialog → server action → toast).
Feature folders only define columns, filters and forms.

## 8. Route structure

`/login` · `/` · `/sellers` `/sellers/[id]` · `/stores` `/stores/[id]` · `/plans` ·
`/subscriptions` `/subscriptions/[id]` · `/themes` · `/orders` `/orders/[id]` ·
`/customers` `/customers/[id]` · `/payments` · `/payouts` · `/domains` · `/support`
`/support/[id]` · `/users` · `/analytics` · `/audit-logs` · `/settings`

## 9. Implementation phases

1. Foundation: tooling, Prisma schema + migration, seeds, config.
2. Security core: sessions, login/logout, RBAC, action factory, audit, middleware, headers.
3. UI system + shell (sidebar, header, toast, tables, filters, dialogs, charts).
4. Overview + analytics (DB aggregations with range filters).
5. Sellers, stores, plans, subscriptions, themes.
6. Orders, customers, payments, payouts, domains.
7. Support, users & roles, audit logs, settings.
8. Demo data, verification (typecheck, build, tests, browser walkthrough), docs.

## Security notes

- Secrets only in environment variables (`.env`, validated in `lib/env.ts`); the settings UI shows
  only *whether* a payment/email credential is configured, never its value.
- Server Actions get Next.js' built-in Origin/Host CSRF check; cookies are `SameSite=Lax`.
- All SQL is Prisma or parameterized `Prisma.sql`; raw identifiers come from a closed whitelist.
- Security headers set in `next.config.ts`. Rate limiting is applied to login and the
  action factory accepts an optional `rateLimit` option.
