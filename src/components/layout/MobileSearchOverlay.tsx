"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useUi } from "@/store/ui";
import { SearchBar } from "./SearchBar";

export function MobileSearchOverlay() {
  const open = useUi((state) => state.searchOpen);
  const setOpen = useUi((state) => state.setSearchOpen);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname, setOpen]);
  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Search">
      <SearchBar variant="overlay" onDone={() => setOpen(false)} />
    </Modal>
  );
}
