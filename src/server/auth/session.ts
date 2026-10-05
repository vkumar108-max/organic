import "server-only";
import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { db } from "../db";
import { SESSION_COOKIE } from "@/config/app";
import { env } from "@/lib/env";

const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;
const IDLE_TIMEOUT_MS = 8 * 60 * 60 * 1000;

export async function createSession(userId: string, info: { ip: string | null; userAgent: string | null }) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + env.sessionTtlHours * 3600_000);
  await db.session.create({ data: { userId, tokenHash: hashToken(token), expiresAt, ip: info.ip, userAgent: info.userAgent } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Look up the session for the current request. Returns null when missing, expired, idle or revoked. */
export async function findSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!session || session.revokedAt) return null;
  const now = Date.now();
  if (session.expiresAt.getTime() < now || now - session.lastSeenAt.getTime() > IDLE_TIMEOUT_MS) return null;
  if (session.user.status !== "ACTIVE") return null;
  if (now - session.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await db.session.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => {});
  }
  return session;
}

export async function destroyCurrentSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.updateMany({ where: { tokenHash: hashToken(token) }, data: { revokedAt: new Date() } });
  jar.delete(SESSION_COOKIE);
}

/** Revoke every session of a user (used on disable, role change, password change). */
export const revokeUserSessions = (userId: string) =>
  db.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
