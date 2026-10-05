import { requirePermission } from "@/server/rbac/context";
import { db } from "@/server/db";
import { Card, CardBody, CardHeader, PageHeader } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { ActionButton, RowActions } from "@/components/data/action-dialog";
import { EmptyState } from "@/components/ui/states";
import { Cell2, MiniTable, Td } from "@/features/shared/ui";
import { createRoleAction, createUserAction, roleActions, userRowActions } from "@/features/users/user-actions";
import { PERMISSION_GROUPS } from "@/config/permissions";
import { formatDateTime, timeAgo } from "@/lib/format";

export const metadata = { title: "Users & Roles" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const ctx = await requirePermission("users.view");
  const tab = (await searchParams).tab === "roles" ? "roles" : "users";
  const manage = ctx.can("users.manage");
  const [users, roles] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "asc" }, include: { roles: { include: { role: true } } } }),
    db.role.findMany({ orderBy: [{ isSystem: "desc" }, { name: "asc" }], include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } } }),
  ]);
  const roleOpts = roles.map((r) => ({ id: r.id, name: r.name }));
  return (
    <>
      <PageHeader title="Users & roles" description="Who can access the admin panel and what they can do." actions={manage && (tab === "users" ? <ActionButton variant="primary" def={createUserAction(roleOpts)} /> : <ActionButton variant="primary" def={createRoleAction()} />)} />
      <Tabs basePath="/users" active={tab} items={[{ key: "users", label: "Admin users", count: users.length }, { key: "roles", label: "Roles & permissions", count: roles.length }]} />
      {tab === "users" ? (
        <Card>
          <MiniTable head={["User", "Roles", "Status", "Last sign-in", "2FA", ""]}>
            {users.map((u) => (
              <tr key={u.id}>
                <Td><Cell2 primary={<>{u.name}{u.id === ctx.user.id && <span className="ml-2 text-xs font-normal text-slate-400">(you)</span>}</>} secondary={u.email} /></Td>
                <Td><div className="flex flex-wrap gap-1">{u.roles.map((r) => <Badge key={r.roleId} tone={r.role.key === "super_admin" ? "purple" : "blue"}>{r.role.name}</Badge>)}</div></Td>
                <Td><StatusBadge status={u.status} /></Td>
                <Td><span title={formatDateTime(u.lastLoginAt)}>{timeAgo(u.lastLoginAt)}</span></Td>
                <Td>{u.twoFactorEnabled ? "On" : <span className="text-slate-400">Off</span>}</Td>
                <Td className="text-right"><RowActions actions={userRowActions({ id: u.id, name: u.name, email: u.email, active: u.status === "ACTIVE", roleIds: u.roles.map((r) => r.roleId) }, roleOpts, manage, u.id === ctx.user.id)} /></Td>
              </tr>
            ))}
          </MiniTable>
        </Card>
      ) : roles.length === 0 ? <Card><EmptyState title="No roles" /></Card> : (
        <div className="grid gap-5 lg:grid-cols-2">
          {roles.map((r) => {
            const keys = new Set(r.permissions.map((p) => p.permission.key));
            return (
              <Card key={r.id}>
                <CardHeader title={<span className="flex items-center gap-2">{r.name}{r.isSystem && <Badge tone="gray">System</Badge>}</span>} description={`${r.description ?? ""} · ${r._count.users} user${r._count.users === 1 ? "" : "s"}`}
                  action={manage ? <RowActions actions={roleActions({ ...r, permissions: [...keys], users: r._count.users }, manage)} /> : undefined} />
                <CardBody className="space-y-2.5">
                  {PERMISSION_GROUPS.map((g) => {
                    const have = g.items.filter(([k]) => keys.has(k));
                    if (!have.length) return null;
                    return <div key={g.group} className="flex flex-wrap items-center gap-1.5 text-sm"><span className="w-28 shrink-0 text-slate-500">{g.group}</span>{have.map(([k]) => <Badge key={k} tone={k.endsWith("manage") ? "amber" : "gray"}>{k.split(".")[1]}</Badge>)}</div>;
                  })}
                  {keys.size === 0 && <p className="text-sm text-slate-400">No permissions</p>}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
