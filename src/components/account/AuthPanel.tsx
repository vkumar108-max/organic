"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { site } from "@/config/site";
import { fieldErrors, loginSchema } from "@/lib/validation";
import { useAuth } from "@/store/auth";

/**
 * Sign-in / register. The real endpoints return 501 until a backend is
 * connected; in demo mode the shopper may preview the account area with a
 * clearly labelled local session (no password is stored or checked).
 */
export function AuthPanel() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const signInDemo = useAuth((state) => state.signInDemo);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...parsed.data, name: raw.name }) });
      const data = await response.json();
      setNotice(data?.error?.message ?? "Signed in.");
    } catch {
      setNotice("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const demo = (event: React.MouseEvent<HTMLButtonElement>) => {
    const form = event.currentTarget.form!;
    const data = new FormData(form);
    signInDemo(String(data.get("name") || "Demo Customer"), String(data.get("email") || "demo@example.com"));
  };

  return (
    <div className="mx-auto max-w-md rounded-card border border-line bg-white p-6 shadow-card">
      <div role="tablist" aria-label="Account" className="mb-6 grid grid-cols-2 rounded-full bg-brand-50 p-1 text-sm font-semibold">
        {(["login", "register"] as const).map((value) => (
          <button key={value} role="tab" type="button" aria-selected={mode === value} onClick={() => { setMode(value); setNotice(null); setErrors({}); }} className={`rounded-full py-2 ${mode === value ? "bg-white shadow-sm text-brand-800" : "text-ink-soft"}`}>
            {value === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} noValidate className="space-y-4">
        {mode === "register" && <FormField label="Full name" name="name" autoComplete="name" />}
        <FormField label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
        <FormField label="Password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required error={errors.password} hint={mode === "register" ? "At least 8 characters" : undefined} />
        <Button type="submit" full disabled={loading}>{loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</Button>
        {notice && <p role="status" className="rounded-lg bg-sand-50 p-3 text-sm text-clay-600">{notice}</p>}
        {site.dataMode === "demo" && (
          <div className="border-t border-line pt-4 text-center">
            <p className="mb-2 text-xs text-ink-soft">Demo mode: preview the account area with a local, non-secure session.</p>
            <Button type="button" variant="secondary" full onClick={demo}>Continue in demo mode</Button>
          </div>
        )}
      </form>
    </div>
  );
}
