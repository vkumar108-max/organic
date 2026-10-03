import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AccountShell } from "@/components/account/AccountShell";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <PageShell title="My Account" path="/account"><AccountShell>{children}</AccountShell></PageShell>;
}
