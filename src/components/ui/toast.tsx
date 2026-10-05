"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type Toast = { id: number; kind: "success" | "error"; message: string };
const Ctx = createContext<{ toast: (kind: Toast["kind"], message: string) => void }>({ toast: () => {} });

export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const dismiss = (id: number) => setItems((l) => l.filter((t) => t.id !== id));
  const toast = useCallback((kind: Toast["kind"], message: string) => {
    const id = Date.now() + Math.random();
    setItems((l) => [...l, { id, kind, message }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 5000);
  }, []);
  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
        {items.map((t) => (
          <div key={t.id} role="status" className="pointer-events-auto flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
            {t.kind === "success" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />}
            <p className="flex-1 text-sm text-slate-700">{t.message}</p>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
