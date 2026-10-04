"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** "drawer" slides from the left edge on mobile (used for filters) */
  variant?: "dialog" | "drawer";
  size?: "md" | "lg";
}

/**
 * Built on the native <dialog>: focus trap, Escape to close and inert
 * background come from the platform, so no ARIA workarounds are needed.
 */
export function Modal({ open, onClose, title, children, variant = "dialog", size = "md" }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const layout =
    variant === "drawer"
      ? "m-0 h-dvh max-h-dvh w-[88vw] max-w-sm rounded-none animate-slide-in"
      : `m-auto w-[calc(100vw-1.5rem)] ${size === "lg" ? "max-w-4xl" : "max-w-lg"} max-h-[90dvh] rounded-2xl animate-fade-up`;

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      className={`${layout} overflow-y-auto bg-white p-0 text-ink shadow-lift backdrop:bg-black/50`}
    >
      {open && (
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="modal-title" className="text-xl font-semibold">{title}</h2>
            <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-brand-50" aria-label="Close">
              <Icon name="close" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
