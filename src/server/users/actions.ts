"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { ActionError, createAction, idSchema } from "../actions/create-action";
import { hashPassword, passwordProblems } from "../auth/password";
import { revokeUserSessions } from "../auth/session";
import { ALL_PERMISSION_KEYS } from "@/config/permissions";
import { SUPER_ADMIN_ROLE } from "@/config/roles";
import type { Tx } from "../db";
import type { ActionCtx } from "../actions/create-action";

const password = z.string().max(128).superRefine((v, c) => { const p = passwordProblems(v); if (p) c.addIssue({ code: "custom", message: p }); });
const roleIds = z.array(z.string().max(40)).min(1, "Choose at least one role").max(10);

/** Prevent privilege escalation: you can only hand out permissions you hold yourself (Super Admin excepted). */
async function assertCanGrantRoles(tx: Tx, ctx: ActionCtx, ids: string[]) {
  const roles = await tx.role.findMany({ where: { id: { in: ids } }, include: { permissions: { include: { permission: true } } } });
  if (roles.length !== ids.length) throw new ActionError("One of the selected roles no longer exists.");
  if (ctx.isSuperAdmin) return roles;
  for (const r of roles) {
    if (r.key === SUPER_ADMIN_ROLE) throw new ActionError("Only a Super Admin can grant the Super Admin role.");
    const missing = r.permissions.find((p) => !ctx.permissions.has(p.permission.key));
    if (missing) throw new ActionError(`You can't grant “${r.name}”: it includes ${missing.permission.key}, which you don't have.`);
  }
  return roles;
}

async function activeSuperAdminCount(tx: Tx, excludeUserId?: string) {
  return tx.user.count({ where: { status: "ACTIVE", ...(excludeUserId ? { id: { not: excludeUserId } } : {}), roles: { some: { role: { key: SUPER_ADMIN_ROLE } } } } });
}

export const createUser = createAction({
  permission: "users.manage",
  schema: z.object({ name: z.string().trim().min(2, "Name is required").max(80), email: z.string().trim().toLowerCase().email("Enter a valid email").max(160), password, roleIds }),
  handler: async ({ name, email, password, roleIds }, ctx) => {
    const passwordHash = await hashPassword(password);
    try {
      await ctx.tx(async (tx) => {
        const roles = await assertCanGrantRoles(tx, ctx, roleIds);
        const user = await tx.user.create({ data: { name, email, passwordHash, passwordChangedAt: new Date(), roles: { create: roleIds.map((roleId) => ({ roleId })) } } });
        await ctx.audit({ action: "user.created", targetType: "User", targetId: user.id, description: `Created admin user ${email} with ${roles.map((r) => r.name).join(", ")}`, metadata: { roles: roles.map((r) => r.key) } }, tx);
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") throw new ActionError("A user with that email already exists.", { email: "Email already in use" });
      throw e;
    }
    return `Admin user ${email} created.`;
  },
});

export const updateUserRoles = createAction({
  permission: "users.manage",
  schema: idSchema.extend({ roleIds }),
  handler: async ({ id, roleIds }, ctx) => {
    await ctx.tx(async (tx) => {
      const user = await tx.user.findUnique({ where: { id }, include: { roles: { include: { role: true } } } });
      if (!user) throw new ActionError("User not found.");
      const next = await assertCanGrantRoles(tx, ctx, roleIds);
      const wasSuper = user.roles.some((r) => r.role.key === SUPER_ADMIN_ROLE);
      const willBeSuper = next.some((r) => r.key === SUPER_ADMIN_ROLE);
      if (wasSuper && !ctx.isSuperAdmin) throw new ActionError("Only a Super Admin can change a Super Admin's roles.");
      if (wasSuper && !willBeSuper && (await activeSuperAdminCount(tx, id)) === 0) throw new ActionError("You can't remove the last active Super Admin.");
      await tx.userRole.deleteMany({ where: { userId: id } });
      await tx.userRole.createMany({ data: roleIds.map((roleId) => ({ userId: id, roleId })) });
      await ctx.audit({ action: "user.roles_changed", targetType: "User", targetId: id, description: `Changed roles for ${user.email}: ${user.roles.map((r) => r.role.name).join(", ")} → ${next.map((r) => r.name).join(", ")}`, metadata: { from: user.roles.map((r) => r.role.key), to: next.map((r) => r.key) } }, tx);
    });
    return "Roles updated.";
  },
});

export const setUserStatus = createAction({
  permission: "users.manage",
  schema: idSchema.extend({ active: z.boolean() }),
  handler: async ({ id, active }, ctx) => {
    await ctx.tx(async (tx) => {
      const user = await tx.user.findUnique({ where: { id }, include: { roles: { include: { role: true } } } });
      if (!user) throw new ActionError("User not found.");
      if (!active) {
        if (id === ctx.user.id) throw new ActionError("You can't disable your own account.");
        if (user.roles.some((r) => r.role.key === SUPER_ADMIN_ROLE)) {
          if (!ctx.isSuperAdmin) throw new ActionError("Only a Super Admin can disable a Super Admin.");
          if ((await activeSuperAdminCount(tx, id)) === 0) throw new ActionError("You can't disable the last active Super Admin.");
        }
      }
      await tx.user.update({ where: { id }, data: { status: active ? "ACTIVE" : "DISABLED", failedLoginCount: 0, lockedUntil: null } });
      if (!active) await tx.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
      await ctx.audit({ action: active ? "user.enabled" : "user.disabled", targetType: "User", targetId: id, description: `${active ? "Enabled" : "Disabled"} admin user ${user.email}` }, tx);
    });
    return active ? "User enabled." : "User disabled and signed out.";
  },
});

export const resetUserPassword = createAction({
  permission: "users.manage",
  schema: idSchema.extend({ password }),
  handler: async ({ id, password }, ctx) => {
    const passwordHash = await hashPassword(password);
    await ctx.tx(async (tx) => {
      const user = await tx.user.findUnique({ where: { id }, include: { roles: { include: { role: true } } } });
      if (!user) throw new ActionError("User not found.");
      if (user.roles.some((r) => r.role.key === SUPER_ADMIN_ROLE) && !ctx.isSuperAdmin) throw new ActionError("Only a Super Admin can reset a Super Admin's password.");
      await tx.user.update({ where: { id }, data: { passwordHash, passwordChangedAt: new Date(), failedLoginCount: 0, lockedUntil: null } });
      await ctx.audit({ action: "user.password_reset", targetType: "User", targetId: id, description: `Reset password for ${user.email}` }, tx);
    });
    await revokeUserSessions(id);
    return "Password reset. The user has been signed out everywhere.";
  },
});

const permKeys = z.array(z.enum(ALL_PERMISSION_KEYS as [string, ...string[]])).max(100);

async function assertPermsGrantable(ctx: ActionCtx, keys: string[]) {
  if (ctx.isSuperAdmin) return;
  const missing = keys.find((k) => !ctx.permissions.has(k));
  if (missing) throw new ActionError(`You can't grant ${missing} because you don't have it yourself.`);
}

async function syncPermissions(tx: Tx, roleId: string, keys: string[]) {
  const perms = await tx.permission.findMany({ where: { key: { in: keys } } });
  await tx.rolePermission.deleteMany({ where: { roleId } });
  await tx.rolePermission.createMany({ data: perms.map((p) => ({ roleId, permissionId: p.id })) });
}

export const createRole = createAction({
  permission: "users.manage",
  schema: z.object({ name: z.string().trim().min(2, "Name is required").max(40), description: z.string().trim().max(200).optional(), permissions: permKeys }),
  handler: async ({ name, description, permissions }, ctx) => {
    await assertPermsGrantable(ctx, permissions);
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    try {
      await ctx.tx(async (tx) => {
        const role = await tx.role.create({ data: { key, name, description: description || null } });
        await syncPermissions(tx, role.id, permissions);
        await ctx.audit({ action: "role.created", targetType: "Role", targetId: role.id, description: `Created role ${name} with ${permissions.length} permissions`, metadata: { permissions } }, tx);
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") throw new ActionError("A role with that name already exists.", { name: "Name already in use" });
      throw e;
    }
    return `Role “${name}” created.`;
  },
});

export const updateRole = createAction({
  permission: "users.manage",
  schema: idSchema.extend({ name: z.string().trim().min(2).max(40), description: z.string().trim().max(200).optional(), permissions: permKeys }),
  handler: async ({ id, name, description, permissions }, ctx) => {
    await assertPermsGrantable(ctx, permissions);
    await ctx.tx(async (tx) => {
      const role = await tx.role.findUnique({ where: { id }, include: { permissions: { include: { permission: true } } } });
      if (!role) throw new ActionError("Role not found.");
      if (role.key === SUPER_ADMIN_ROLE) throw new ActionError("The Super Admin role can't be edited.");
      const before = role.permissions.map((p) => p.permission.key).sort();
      await tx.role.update({ where: { id }, data: { description: description || null, ...(role.isSystem ? {} : { name }) } });
      await syncPermissions(tx, id, permissions);
      const after = [...permissions].sort();
      await ctx.audit({ action: "role.permissions_changed", targetType: "Role", targetId: id,
        description: `Updated role ${role.name}: +${after.filter((p) => !before.includes(p)).length} / −${before.filter((p) => !after.includes(p)).length} permissions`,
        metadata: { added: after.filter((p) => !before.includes(p)), removed: before.filter((p) => !after.includes(p)) } }, tx);
    });
    return "Role updated. Changes apply immediately.";
  },
});

export const deleteRole = createAction({
  permission: "users.manage",
  schema: idSchema,
  handler: async ({ id }, ctx) => {
    await ctx.tx(async (tx) => {
      const role = await tx.role.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
      if (!role) throw new ActionError("Role not found.");
      if (role.isSystem) throw new ActionError("System roles can't be deleted.");
      if (role._count.users > 0) throw new ActionError(`${role._count.users} user(s) still have this role. Reassign them first.`);
      await tx.role.delete({ where: { id } });
      await ctx.audit({ action: "role.deleted", targetType: "Role", targetId: id, description: `Deleted role ${role.name}` }, tx);
    });
    return "Role deleted.";
  },
});
