"use client";

import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, ShieldCheck } from "lucide-react";
import { titleForPath } from "@/config/nav";
import { useOpenMobileMenu } from "./shell";
import { Dropdown } from "@/components/ui/dropdown";
import { logoutAction } from "@/server/auth/login";
import { initials } from "@/lib/format";

export type NotificationItem = { label: string; count: number; href: string };

export function Header({ user, roles, notifications }: { user: { name: string; email: string }; roles: string[]; notifications: NotificationItem[] }) {
  const title = titleForPath(usePathname());
  const openMenu = useOpenMobileMenu();
  const total = notifications.reduce((s, n) => s + n.count, 0);
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button onClick={openMenu} aria-label="Open menu" className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
      <h2 className="min-w-0 flex-1 truncate text-lg font-semibold text-slate-900">{title}</h2>

      <Dropdown
        label="Notifications"
        trigger={
          <span className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
            <Bell className="h-5 w-5" />
            {total > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">{total > 99 ? "99+" : total}</span>}
          </span>
        }
        items={notifications.length ? notifications.map((n) => ({ label: `${n.count} ${n.label}`, href: n.href, onSelect: () => {} })) : [{ label: "You're all caught up", onSelect: () => {} }]}
      />

      <Dropdown
        label="Account"
        trigger={
          <span className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">{initials(user.name)}</span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block max-w-[10rem] truncate text-sm font-medium text-slate-800">{user.name}</span>
              <span className="block max-w-[10rem] truncate text-xs text-slate-500">{roles.join(", ")}</span>
            </span>
          </span>
        }
        items={[
          { label: user.email, icon: <ShieldCheck className="h-4 w-4 text-slate-400" />, onSelect: () => {} },
          { label: "Sign out", icon: <LogOut className="h-4 w-4" />, destructive: true, onSelect: () => { void logoutAction(); } },
        ]}
      />
    </header>
  );
}

