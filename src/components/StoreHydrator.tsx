"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { useDemoOrders } from "@/store/orders";
import { useUi } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";

/** Loads persisted client state after mount so server and client HTML always match. */
export function StoreHydrator() {
  useEffect(() => {
    void useCart.persist.rehydrate();
    void useWishlist.persist.rehydrate();
    void useAuth.persist.rehydrate();
    void useDemoOrders.persist.rehydrate();
    void useUi.persist.rehydrate();
  }, []);
  return null;
}
