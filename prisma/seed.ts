/**
 * CORE seed — safe for production. Idempotent.
 * Creates the permission catalog, system roles, default plans, theme categories, default settings
 * and (only when no admin user exists) the first Super Admin from BOOTSTRAP_ADMIN_* env vars.
 * Demo data lives in prisma/seed-demo.ts and is never run from here.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { ALL_PERMISSIONS } from "../src/config/permissions";
import { SYSTEM_ROLES } from "../src/config/roles";
import { SETTINGS_SECTIONS } from "../src/server/settings/definitions";

const db = new PrismaClient();

const PLANS = [
  { key: "free", name: "Free", description: "Try STORELAUNCH with a small catalogue.", monthlyPrice: 0, yearlyPrice: 0, trialDays: 0, productLimit: 10, orderLimit: 50, storageLimitMb: 500, features: [], sortOrder: 1 },
  { key: "starter", name: "Starter", description: "For new stores finding their first customers.", monthlyPrice: 19, yearlyPrice: 190, trialDays: 14, productLimit: 100, orderLimit: 500, storageLimitMb: 5120, features: ["free_ssl", "discount_codes"], sortOrder: 2 },
  { key: "growth", name: "Growth", description: "Everything growing brands need to scale.", monthlyPrice: 49, yearlyPrice: 490, trialDays: 14, productLimit: 1000, orderLimit: 5000, storageLimitMb: 25600, features: ["custom_domain", "free_ssl", "premium_themes", "discount_codes", "abandoned_cart", "multi_staff"], sortOrder: 3, isPopular: true },
  { key: "pro", name: "Pro", description: "Unlimited scale with advanced tooling and priority support.", monthlyPrice: 129, yearlyPrice: 1290, trialDays: 14, productLimit: null, orderLimit: null, storageLimitMb: null, features: ["custom_domain", "free_ssl", "premium_themes", "discount_codes", "abandoned_cart", "advanced_analytics", "multi_staff", "api_access", "priority_support", "remove_branding", "multi_currency", "bulk_import"], sortOrder: 4 },
];

const CATEGORIES = [["fashion", "Fashion"], ["grocery", "Grocery"], ["restaurant", "Restaurant"], ["electronics", "Electronics"], ["food", "Food"], ["digital-products", "Digital Products"]];

async function main() {
  for (const p of ALL_PERMISSIONS) {
    await db.permission.upsert({ where: { key: p.key }, create: p, update: { description: p.description, group: p.group } });
  }
  const perms = new Map((await db.permission.findMany()).map((p) => [p.key, p.id]));

  for (const r of SYSTEM_ROLES) {
    const existing = await db.role.findUnique({ where: { key: r.key } });
    const role = existing ?? (await db.role.create({ data: { key: r.key, name: r.name, description: r.description, isSystem: true } }));
    // Only (re)apply permissions on first creation, so admin edits survive re-seeding. Super Admin always gets all.
    if (!existing || r.key === "super_admin") {
      await db.rolePermission.deleteMany({ where: { roleId: role.id } });
      await db.rolePermission.createMany({ data: r.permissions.map((k) => ({ roleId: role.id, permissionId: perms.get(k)! })) });
    }
  }

  for (const p of PLANS) await db.plan.upsert({ where: { key: p.key }, create: p, update: {} });
  for (const [i, [key, name]] of CATEGORIES.entries()) await db.themeCategory.upsert({ where: { key: key! }, create: { key: key!, name: name!, sortOrder: i }, update: {} });
  for (const s of SETTINGS_SECTIONS) await db.platformSetting.upsert({ where: { key: s.id }, create: { key: s.id, group: s.id, value: s.defaults }, update: {} });

  if ((await db.user.count()) === 0) {
    const email = (process.env.BOOTSTRAP_ADMIN_EMAIL ?? "").trim().toLowerCase();
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? "";
    if (!email || password.length < 12) throw new Error("Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD (min 12 chars) to create the first Super Admin.");
    if (process.env.NODE_ENV === "production" && password === "ChangeMe!12345") throw new Error("Refusing to bootstrap production with the example password.");
    const role = await db.role.findUniqueOrThrow({ where: { key: "super_admin" } });
    await db.user.create({
      data: { email, name: process.env.BOOTSTRAP_ADMIN_NAME ?? "Platform Owner", passwordHash: await bcrypt.hash(password, 12), passwordChangedAt: new Date(), roles: { create: { roleId: role.id } } },
    });
    console.log(`Created first Super Admin: ${email}`);
  }
  console.log("Core seed complete.");
}

main().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
