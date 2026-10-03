import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Snapshot needed to render the cart without a network round trip.
 *  Authoritative prices are re-read from the catalogue when the order is placed. */
export interface CartLine {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  category: string;
  variantLabel: string;
  price: number;
  mrp: number;
  stock: number;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  couponCode: string | null;
  couponDiscount: number;
  hydrated: boolean;
  addLine: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  removeLine: (variantId: string) => void;
  setCoupon: (code: string | null, discount: number) => void;
  clear: () => void;
}

export const MAX_PER_LINE = 20;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      couponCode: null,
      couponDiscount: 0,
      hydrated: false,
      addLine: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((candidate) => candidate.variantId === line.variantId);
          const limit = Math.min(MAX_PER_LINE, line.stock);
          if (existing) {
            return {
              lines: state.lines.map((candidate) =>
                candidate.variantId === line.variantId ? { ...candidate, ...line, quantity: Math.min(limit, candidate.quantity + quantity) } : candidate,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity: Math.min(limit, quantity) }] };
        }),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.variantId === variantId ? { ...line, quantity: Math.max(1, Math.min(quantity, MAX_PER_LINE, line.stock)) } : line,
          ),
        })),
      removeLine: (variantId) => set((state) => ({ lines: state.lines.filter((line) => line.variantId !== variantId) })),
      setCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      clear: () => set({ lines: [], couponCode: null, couponDiscount: 0 }),
    }),
    {
      name: "vr-cart-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ lines, couponCode, couponDiscount }) => ({ lines, couponCode, couponDiscount }),
      onRehydrateStorage: () => () => useCart.setState({ hydrated: true }),
    },
  ),
);

export const selectCartCount = (state: CartState) => state.lines.reduce((sum, line) => sum + line.quantity, 0);
export const selectCartSubtotal = (state: CartState) => state.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
