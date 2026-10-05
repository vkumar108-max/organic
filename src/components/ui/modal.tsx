"use client";

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { open: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode; size?: "sm" | "md" | "lg"; side?: boolean };

/** Shared shell for Modal (centered) and Drawer (side=true). */
function Overlay({ open, onClose, title, description, children, footer, size = "md", side }: Props) {
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  const width = side ? "max-w-md" : { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" }[size];
  return createPortal(
    <div className={cn("fixed inset-0 z-50 flex text-left", side ? "justify-end" : "items-center justify-center p-4")}>
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-labelledby={id} className={cn("relative flex max-h-full w-full flex-col bg-white shadow-xl", width, side ? "h-full" : "rounded-xl")}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id={id} className="text-base font-semibold text-slate-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:rounded-b-xl">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export const Modal = (p: Omit<Props, "side">) => <Overlay {...p} />;
export const Drawer = (p: Omit<Props, "side" | "size">) => <Overlay {...p} side />;
