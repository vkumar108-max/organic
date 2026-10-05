# STORELAUNCH — Super Admin Panel (Part 1)

Private control center for the STORELAUNCH platform owner: sellers, stores, plans, subscriptions,
themes, orders, customers, payments, payouts, domains, support, users & roles, analytics, audit logs
and settings. The Seller Dashboard and Customer Storefront are **separate products** (not in this repo);
they will share the Prisma schema / database. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Stack: Next.js 15 (App Router) · TypeScript · Tailwind · PostgreSQL · Prisma · zod · Recharts.

## Run locally

```bash
cp .env.example .env              # set DATABASE_URL and BOOTSTRAP_ADMIN_* (min 12-char password)
npm install
npx prisma migrate deploy         # or `npm run db:migrate` in development
npm run db:seed                   # CORE seed (production-safe): permissions, roles, plans, categories, settings, first Super Admin
npm run db:seed:demo              # DEMO data (blocked in production unless ALLOW_DEMO_SEED=true)
npm run dev                       # http://localhost:3000  -> sign in
```

Demo logins (after `db:seed:demo`, password `Demo!Passw0rd12`): `admin@`, `support@`, `finance@`,
`themes@storelaunch.test`, plus the bootstrap Super Admin from `.env`. Each role sees a different
navigation, which is the quickest way to see RBAC. Start over with `npm run db:reset:demo`.

Other scripts: `npm run typecheck` · `npm test` · `npm run build` · `GET /api/health`.

## Security model (summary)

- Opaque DB-backed sessions (SHA-256 hashed token, httpOnly / SameSite=Lax / Secure+`__Host-` in prod), expiry + idle timeout, revocation.
- bcrypt(12), generic login errors, lockout + rate limiting (swap `lib/rate-limit.ts` for Redis when scaling out).
- `middleware.ts` is a UX redirect only. Every page calls `requirePermission()`; every mutation goes through
  `createAction()` (session → permission → validation → business rules → audit). Permissions are read from the DB per request.
- Privilege-escalation guards (can't grant permissions you lack; last Super Admin protected).
- AuditLog is append-only, enforced by a Postgres trigger.
- Secrets live in env vars; Settings shows only whether they're configured.

## Known scope limits

2FA, email verification, password reset and OAuth have schema/architecture hooks but no UI yet.
DNS/SSL provisioning and real payment-gateway calls are intentionally out of scope (admin data model only).
The in-memory rate limiter is per-process. Seller/store/theme pages are read/manage only — no builders.
