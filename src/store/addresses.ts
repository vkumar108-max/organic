import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Address } from "@/types";

/** DEMO/local: saved on this device only. Replace with `/account/addresses` API calls. */
interface AddressState {
  addresses: (Address & { id: string })[];
  add: (address: Address) => void;
  remove: (id: string) => void;
}

export const useAddresses = create<AddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      add: (address) => set({ addresses: [...get().addresses, { ...address, id: crypto.randomUUID() }].slice(0, 10) }),
      remove: (id) => set({ addresses: get().addresses.filter((address) => address.id !== id) }),
    }),
    { name: "vr-addresses-v1", storage: createJSONStorage(() => localStorage) },
  ),
);
