import { BarChart3, Boxes, CreditCard, Globe, LayoutDashboard, LifeBuoy, Palette, Receipt, ScrollText, Settings, ShieldCheck, Store, Tags, Users, UserSquare2, Wallet, type LucideIcon } from "lucide-react";
import type { NavIcon } from "@/config/nav";

export const NAV_ICON_MAP: Record<NavIcon, LucideIcon> = {
  overview: LayoutDashboard, sellers: UserSquare2, stores: Store, plans: Tags, subscriptions: Receipt, themes: Palette,
  orders: Boxes, customers: Users, payments: CreditCard, payouts: Wallet, domains: Globe, support: LifeBuoy,
  users: ShieldCheck, analytics: BarChart3, audit: ScrollText, settings: Settings,
};
