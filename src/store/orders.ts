import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Order } from "@/types";

/**
 * DEMO ONLY: in demo mode there is no order database, so orders placed in this
 * browser are kept locally to let you click through the whole customer journey.
 * In live mode orders come from the backend and this store is unused.
 */
interface OrdersState {
  orders: Order[];
  hydrated: boolean;
  add: (order: Order) => void;
}

export const useDemoOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      hydrated: false,
      add: (order) => set({ orders: [order, ...get().orders].slice(0, 20) }),
    }),
    {
      name: "vr-demo-orders-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ orders }) => ({ orders }),
      onRehydrateStorage: () => () => useDemoOrders.setState({ hydrated: true }),
    },
  ),
);
