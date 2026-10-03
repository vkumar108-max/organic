"use client";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/format";
import { useUi } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";

interface WishlistButtonProps {
  slug: string;
  name: string;
  variant?: "icon" | "full";
  className?: string;
}

export function WishlistButton({ slug, name, variant = "icon", className }: WishlistButtonProps) {
  const saved = useWishlist((state) => state.slugs.includes(slug));
  const toggle = useWishlist((state) => state.toggle);
  const notify = useUi((state) => state.notify);

  const onClick = () => {
    const nowSaved = toggle(slug);
    notify(nowSaved ? `${name} saved to wishlist` : `${name} removed from wishlist`, "success", nowSaved ? { label: "View", href: "/wishlist" } : undefined);
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-5 text-sm font-semibold hover:bg-brand-50", saved && "border-brand-600 text-brand-700", className)}
      >
        <Icon name="heart" size={18} filled={saved} className={saved ? "text-red-500" : ""} />
        {saved ? "Saved to wishlist" : "Add to wishlist"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      className={cn("grid h-9 w-9 place-items-center rounded-full bg-white/95 text-ink shadow-sm transition hover:scale-105", className)}
    >
      <Icon name="heart" size={18} filled={saved} className={saved ? "text-red-500" : ""} />
    </button>
  );
}
