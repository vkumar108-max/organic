import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "../db";
import { findSession } from "../auth/session";
import { SUPER_ADMIN_ROLE } from "@/config/roles";
import { ALL_PERMISSION_KEYS, type PermissionKey } from "@/config/permissions";

export type AuthContext = {
  user: { id: string; email: string; name: string };
  roles: { key: string; name: string }[];
  permissions: ReadonlySet<string>;
  isSuperAdmin: boolean;
  can: (p: PermissionKey) => boolean;
};

/** Per-request cached. Permissions are always read from the DB — never from the client or the cookie. */
export const getAuthContext = cache(async (): Promise<AuthContext | null> => {
  const session = await findSession();
  if (!session) return null;
  const roleLinks = await db.userRole.findMany({
    where: { userId: session.userId },
    include: { role: { include: { permissions: { include: { permission: true } } } } },
  });
  if (roleLinks.length === 0) return null; // no role => no access
  const isSuperAdmin = roleLinks.some((r) => r.role.key === SUPER_ADMIN_ROLE);
  const permissions = new Set<string>(
    isSuperAdmin ? ALL_PERMISSION_KEYS : roleLinks.flatMap((r) => r.role.permissions.map((p) => p.permission.key)),
  );
  return {
    user: { id: session.user.id, email: session.user.email, name: session.user.name },
    roles: roleLinks.map((r) => ({ key: r.role.key, name: r.role.name })),
    permissions,
    isSuperAdmin,
    can: (p) => permissions.has(p),
  };
});

export async function requireUser(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");
  return ctx;
}

/** For pages: redirect to the 403 page when the permission is missing. */
export async function requirePermission(...needed: PermissionKey[]): Promise<AuthContext> {
  const ctx = await requireUser();
  if (!needed.every((p) => ctx.can(p))) redirect("/forbidden");
  return ctx;
}
