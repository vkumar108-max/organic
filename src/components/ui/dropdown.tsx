"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type MenuItem = { label: string; onSelect: () => void; destructive?: boolean; icon?: React.ReactNode; href?: string };

/** Menu rendered in a portal with fixed positioning so table overflow never clips it. */
export function Dropdown({ trigger, items, align = "right", label = "Actions" }: { trigger: React.ReactNode; items: MenuItem[]; align?: "left" | "right"; label?: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (!menu.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const toggle = () => {
    if (!open && btn.current) {
      const r = btn.current.getBoundingClientRect();
      const menuW = 208;
      const left = align === "right" ? Math.max(8, r.right - menuW) : Math.min(r.left, window.innerWidth - menuW - 8);
      const estHeight = items.length * 36 + 12;
      const top = r.bottom + estHeight > window.innerHeight ? Math.max(8, r.top - estHeight - 4) : r.bottom + 4;
      setPos({ top, left });
    }
    setOpen((o) => !o);
  };

  return (
    <>
      <button ref={btn} type="button" aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={toggle} className="inline-flex items-center">{trigger}</button>
      {open && pos && typeof document !== "undefined" && createPortal(
        <div ref={menu} role="menu" style={{ top: pos.top, left: pos.left }} className="fixed z-[60] w-52 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {items.map((it) => {
            const cls = cn("flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50", it.destructive ? "text-red-600" : "text-slate-700");
            return it.href ? (
              <a key={it.label} role="menuitem" href={it.href} className={cls}>{it.icon}{it.label}</a>
            ) : (
              <button key={it.label} role="menuitem" type="button" className={cls} onClick={() => { setOpen(false); it.onSelect(); }}>{it.icon}{it.label}</button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}
