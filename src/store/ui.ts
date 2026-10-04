import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface ToastMessage {
  id: number;
  message: string;
  tone: "success" | "error" | "info";
  action?: { label: string; href: string };
}

interface UiState {
  toasts: ToastMessage[];
  searchOpen: boolean;
  menuOpen: boolean;
  recentSearches: string[];
  notify: (message: string, tone?: ToastMessage["tone"], action?: ToastMessage["action"]) => void;
  dismiss: (id: number) => void;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
}

let toastId = 0;

export const useUi = create<UiState>()(
  persist(
    (set, get) => ({
      toasts: [],
      searchOpen: false,
      menuOpen: false,
      recentSearches: [],
      notify: (message, tone = "success", action) => {
        const id = ++toastId;
        set({ toasts: [...get().toasts.slice(-2), { id, message, tone, action }] });
        setTimeout(() => get().dismiss(id), 4500);
      },
      dismiss: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setMenuOpen: (menuOpen) => set({ menuOpen }),
      addRecentSearch: (term) => {
        const clean = term.trim();
        if (!clean) return;
        set({ recentSearches: [clean, ...get().recentSearches.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6) });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "vr-ui-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ recentSearches }) => ({ recentSearches }),
    },
  ),
);
