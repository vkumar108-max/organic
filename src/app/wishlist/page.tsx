import type { Metadata } from "next";
import { WishlistView } from "@/components/account/WishlistView";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = { title: "My Wishlist", robots: { index: false, follow: false } };

export default function WishlistPage() {
  return <PageShell title="My Wishlist" path="/wishlist" intro="Products you’ve saved. Wishlists are kept on this device until the account backend is connected."><WishlistView /></PageShell>;
}
