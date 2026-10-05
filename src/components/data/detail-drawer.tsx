"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

/** Button that opens a side drawer. Children are server-rendered and passed in, so no extra fetching. */
export function DetailDrawer({ label, title, description, children, variant = "ghost" }: { label: string; title: string; description?: string; children: React.ReactNode; variant?: "ghost" | "secondary" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant={variant} onClick={() => setOpen(true)}>{label}</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title={title} description={description}>{children}</Drawer>
    </>
  );
}
