"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "../db";
import { verifyPassword } from "./password";
import { createSession, destroyCurrentSession } from "./session";
import { getRequestInfo } from "./request-info";
import { writeAudit } from "../audit";
import { getAuthContext } from "../rbac/context";
import { limiter } from "@/lib/rate-limit";
import { getSecuritySettings } from "../settings/security";

export type LoginState = { error?: string } | undefined;

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(200), password: z.string().min(1).max(200) });
const GENERIC = "Invalid email or password.";

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: GENERIC };
  const { email, password } = parsed.data;
  const info = await getRequestInfo();

  // Rate limits: per IP and per email (rate-limit-ready; swap the limiter implementation for Redis).
  if (!limiter.hit(`login:ip:${info.ip}`, 20, 15 * 60_000) || !limiter.hit(`login:email:${email}`, 8, 15 * 60_000)) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  const user = await db.user.findUnique({ where: { email }, include: { roles: true } });
  const security = await getSecuritySettings();

  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    await writeAudit({ action: "auth.login_blocked", targetType: "User", targetId: user.id, description: `Login attempt on locked account ${email}`, actor: null });
    return { error: "Account temporarily locked. Try again later." };
  }

  const ok = await verifyPassword(password, user?.passwordHash ?? null);
  if (!user || !ok || user.status !== "ACTIVE" || user.roles.length === 0) {
    if (user) {
      const failed = user.failedLoginCount + 1;
      const lock = failed >= security.maxLoginAttempts;
      await db.user.update({
        where: { id: user.id },
        data: { failedLoginCount: lock ? 0 : failed, lockedUntil: lock ? new Date(Date.now() + security.lockoutMinutes * 60_000) : null },
      });
    }
    await writeAudit({ action: "auth.login_failed", targetType: "User", targetId: user?.id, description: `Failed login for ${email}`, actor: null });
    return { error: GENERIC };
  }

  await db.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() } });
  await createSession(user.id, info);
  limiter.reset(`login:email:${email}`);
  await writeAudit({ action: "auth.login", targetType: "User", targetId: user.id, description: `${user.email} signed in`, actor: { id: user.id, email: user.email } });
  redirect("/");
}

export async function logoutAction() {
  const ctx = await getAuthContext();
  if (ctx) await writeAudit({ action: "auth.logout", targetType: "User", targetId: ctx.user.id, description: `${ctx.user.email} signed out`, actor: ctx.user });
  await destroyCurrentSession();
  redirect("/login");
}
