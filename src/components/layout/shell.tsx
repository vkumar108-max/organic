"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, Menu, Rocket, X } from "lucide-react";
import { type NavItem } from "@/config/nav";
import { APP_NAME, APP_TAGLINE } from "@/config/app";
import { cn } from "@/lib/utils";
import { NAV_ICON_MAP } from "./nav-icons";

type Item = Pick<NavItem, "label" | "href" | "icon">;

function NavList({ items, collapsed, onNavigate }: { items: Item[]; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4" aria-label="Main">
      {items.map((it) => {
        const Icon = NAV_ICON_MAP[it.icon];
        const active = it.href === "/" ? pathname === "/" : pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link key={it.href} href={it.href} onClick={onNavigate} title={collapsed ? it.label : undefined} aria-current={active ? "page" : undefined}
            className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white", collapsed && "justify-center px-2")}>
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{it.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn("flex h-16 items-center gap-2.5 border-b border-slate-800 px-5", collapsed && "justify-center px-2")}>
      <div className="rounded-lg bg-brand-500 p-1.5 text-white"><Rocket className="h-5 w-5" /></div>
      {!collapsed && (
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-wide text-white">{APP_NAME}</p>
          <p className="text-[11px] uppercase tracking-widest text-slate-400">{APP_TAGLINE}</p>
        </div>
      )}
    </div>
  );
}

const MobileMenuContext = createContext<() => void>(() => {});
export const useOpenMobileMenu = () => useContext(MobileMenuContext);

/** Responsive frame: fixed collapsible sidebar on lg+, slide-over menu on smaller screens. */
export function Shell({ navItems, header, children }: { navItems: Item[]; header: React.ReactNode; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { try { setCollapsed(localStorage.getItem("sl_sidebar") === "1"); } catch {} }, []);
  useEffect(() => setMobileOpen(false), [pathname]);

  const toggle = () => setCollapsed((c) => { try { localStorage.setItem("sl_sidebar", c ? "0" : "1"); } catch {} return !c; });

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden flex-col bg-slate-900 transition-[width] lg:flex", collapsed ? "w-[72px]" : "w-64")}>
        <Brand collapsed={collapsed} />
        <NavList items={navItems} collapsed={collapsed} />
        <button onClick={toggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="flex items-center justify-center gap-2 border-t border-slate-800 py-3 text-xs text-slate-400 hover:text-white">
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" />Collapse</>}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="relative flex h-full w-72 max-w-[85%] flex-col bg-slate-900">
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            <Brand collapsed={false} />
            <NavList items={navItems} collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className={cn("transition-[padding]", collapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        <MobileMenuContext.Provider value={() => setMobileOpen(true)}>{header}</MobileMenuContext.Provider>
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

