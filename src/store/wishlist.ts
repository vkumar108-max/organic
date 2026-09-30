import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Guests keep a local wishlist; once the backend is connected, sync this list to
 * the customer account on login (assumption: wishlisting itself needs no login).
 */
interface WishlistState {
  slugs: string[];
  hydrated: boolean;
  toggle: (slug: string) => boolean;
  remove: (slug: string) => void;
  has: (slug: string) => boolean;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      hydrated: false,
      toggle: (slug) => {
        const isSaved = get().slugs.includes(slug);
        set({ slugs: isSaved ? get().slugs.filter((item) => item !== slug) : [slug, ...get().slugs] });
        return !isSaved;
      },
      remove: (slug) => set({ slugs: get().slugs.filter((item) => item !== slug) }),
      has: (slug) => get().slugs.includes(slug),
    }),
    {
      name: "vr-wishlist-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ slugs }) => ({ slugs }),
      onRehydrateStorage: () => () => useWishlist.setState({ hydrated: true }),
    },
  ),
);
