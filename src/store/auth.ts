import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Client-side session view. Real authentication (password hashing, httpOnly
 * session cookies) belongs in the backend — the /api/auth/* routes return
 * 501 until it is connected. `demo: true` sessions are UI previews only.
 */
export interface SessionUser {
  name: string;
  email: string;
  demo: boolean;
}

interface AuthState {
  user: SessionUser | null;
  hydrated: boolean;
  signInDemo: (name: string, email: string) => void;
  signOut: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      signInDemo: (name, email) => set({ user: { name, email, demo: true } }),
      signOut: () => set({ user: null }),
    }),
    {
      name: "vr-session-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ user }) => ({ user }),
      onRehydrateStorage: () => () => useAuth.setState({ hydrated: true }),
    },
  ),
);
