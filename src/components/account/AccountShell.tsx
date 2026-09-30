"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { AccountSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/format";
import { useAuth } from "@/store/auth";
import { AuthPanel } from "./AuthPanel";

const links: { href: string; label: string; icon: IconName }[] = [
  { href: "/account", label: "Dashboard", icon: "home" },
  { href: "/account/orders", label: "My Orders", icon: "box" },
  { href: "/track-order", label: "Track Order", icon: "truck" },
  { href: "/wishlist", label: "Wishlist", icon: "heart" },
  { href: "/account/addresses", label: "Saved Addresses", icon: "pin" },
  { href: "/account/details", label: "Account Details", icon: "user" },
  { href: "/account/password", label: "Change Password", icon: "lock" },
];

/** Protects every /account/* page: skeleton while hydrating, sign-in panel when logged out. */
export function AccountShell({ children }: { children: ReactNode }) {
  const { user, hydrated, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!hydrated) return <AccountSkeleton />;
  if (!user) return <AuthPanel />;

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      <nav aria-label="Account" className="h-fit rounded-card border border-line p-2">
        <p className="px-3 py-2 text-sm text-ink-soft">Signed in as <strong className="text-ink">{user.name}</strong>{user.demo && <span className="ml-1 rounded bg-sand-100 px-1.5 text-xs text-clay-600">demo</span>}</p>
        <ul className="flex gap-1 overflow-x-auto lg:flex-col">
          {links.map((link) => (
            <li key={link.href} className="shrink-0">
              <Link href={link.href} aria-current={pathname === link.href ? "page" : undefined} className={cn("flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-brand-50", pathname === link.href && "bg-brand-100 text-brand-800")}>
                <Icon name={link.icon} size={18} />{link.label}
              </Link>
            </li>
          ))}
          <li className="shrink-0">
            <button type="button" onClick={() => { signOut(); router.push("/"); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-danger hover:bg-red-50"><Icon name="logout" size={18} />Logout</button>
          </li>
        </ul>
      </nav>
      <div>{children}</div>
    </div>
  );
}
