import { requireUser } from "@/server/rbac/context";
import { getNotifications } from "@/server/notifications";
import { NAV_ITEMS } from "@/config/nav";
import { Shell } from "@/components/layout/shell";
import { Header } from "@/components/layout/header";

export const dynamic = "force-dynamic";

/** Server-side gate for every admin route: valid session + at least one role, else redirect to /login. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireUser();
  const navItems = NAV_ITEMS.filter((n) => !n.permission || ctx.can(n.permission)).map(({ label, href, icon }) => ({ label, href, icon }));
  const notifications = await getNotifications(ctx);
  return (
    <Shell
      navItems={navItems}
      header={<Header user={{ name: ctx.user.name, email: ctx.user.email }} roles={ctx.roles.map((r) => r.name)} notifications={notifications} />}
    >
      {children}
    </Shell>
  );
}
