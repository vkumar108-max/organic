import type { ActionDef, FormField } from "@/components/data/action-dialog";
import { createRole, createUser, deleteRole, resetUserPassword, setUserStatus, updateRole, updateUserRoles } from "@/server/users/actions";
import { PERMISSION_GROUPS } from "@/config/permissions";

type RoleOpt = { id: string; name: string };

const roleOptions = (roles: RoleOpt[]) => roles.map((r) => ({ value: r.id, label: r.name }));
const permissionOptions = PERMISSION_GROUPS.flatMap((g) => g.items.map(([key, desc]) => ({ value: key, label: `${g.group}: ${desc}` })));
const passwordField = (label = "Password"): FormField => ({ name: "password", label, type: "password", required: true, help: "Min 12 characters with upper-case, lower-case and a number." });

export const createUserAction = (roles: RoleOpt[]): ActionDef => ({
  label: "Add admin user", action: createUser,
  form: { title: "Add admin user", description: "They sign in with the email and the initial password you set here. Share it securely.", submitLabel: "Create user", fields: [
    { name: "name", label: "Full name", required: true }, { name: "email", label: "Email", type: "email", required: true }, passwordField("Initial password"),
    { name: "roleIds", label: "Roles", type: "checkboxes", options: roleOptions(roles), defaultValue: [] },
  ] },
});

export function userRowActions(u: { id: string; name: string; email: string; active: boolean; roleIds: string[] }, roles: RoleOpt[], canManage: boolean, isSelf: boolean): ActionDef[] {
  const input = { id: u.id };
  return [
    { label: "Edit roles", action: updateUserRoles, input, hidden: !canManage, form: { title: `Roles for ${u.name}`, submitLabel: "Save roles", fields: [{ name: "roleIds", label: "Roles", type: "checkboxes", options: roleOptions(roles), defaultValue: u.roleIds }] } },
    { label: "Reset password", action: resetUserPassword, input, hidden: !canManage, form: { title: `Reset password for ${u.name}`, description: "All of their sessions are ended.", submitLabel: "Reset password", fields: [passwordField("New password")] } },
    { label: "Disable user", action: setUserStatus, input: { ...input, active: false }, destructive: true, hidden: !canManage || !u.active || isSelf, confirm: { title: `Disable ${u.name}?`, description: "They are signed out immediately and can't sign in until re-enabled.", confirmLabel: "Disable user" } },
    { label: "Enable user", action: setUserStatus, input: { ...input, active: true }, hidden: !canManage || u.active },
  ];
}

const roleFields = (r?: { name: string; description: string | null; permissions: string[]; isSystem: boolean }): FormField[] => [
  { name: "name", label: "Role name", required: true, defaultValue: r?.name ?? "", help: r?.isSystem ? "System role names are fixed." : undefined },
  { name: "description", label: "Description", type: "textarea", defaultValue: r?.description ?? "" },
  { name: "permissions", label: "Permissions", type: "checkboxes", options: permissionOptions, defaultValue: r?.permissions ?? [] },
];

export const createRoleAction = (): ActionDef => ({ label: "Create role", action: createRole, form: { title: "Create role", submitLabel: "Create role", size: "lg", fields: roleFields() } });

export function roleActions(r: { id: string; name: string; description: string | null; key: string; isSystem: boolean; permissions: string[]; users: number }, canManage: boolean): ActionDef[] {
  return [
    { label: "Edit permissions", action: updateRole, input: { id: r.id }, hidden: !canManage || r.key === "super_admin", form: { title: `Edit ${r.name}`, description: "Changes apply to all users with this role immediately.", submitLabel: "Save role", size: "lg", fields: roleFields(r) } },
    { label: "Delete role", action: deleteRole, input: { id: r.id }, destructive: true, hidden: !canManage || r.isSystem, confirm: { title: `Delete ${r.name}?`, description: r.users ? `${r.users} user(s) still have this role; reassign them first.` : "This can't be undone.", confirmLabel: "Delete role" } },
  ];
}
