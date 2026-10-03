"use client";

import Link from "next/link";
import { useUi } from "@/store/ui";
import { Icon } from "./Icon";

/** Live-region toast stack. Mounted once in the root layout. */
export function ToastViewport() {
  const toasts = useUi((state) => state.toasts);
  const dismiss = useUi((state) => state.dismiss);
  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-center gap-3 rounded-xl bg-ink px-4 py-3 text-sm text-white shadow-lift"
        >
          <Icon name={toast.tone === "error" ? "alert" : "check"} size={18} className={toast.tone === "error" ? "text-red-300" : "text-brand-300"} />
          <span className="flex-1">{toast.message}</span>
          {toast.action && (
            <Link href={toast.action.href} className="font-semibold text-brand-200 underline" onClick={() => dismiss(toast.id)}>
              {toast.action.label}
            </Link>
          )}
          <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="opacity-70 hover:opacity-100">
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
