"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

export default function PasswordPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Record<string, string> = {};
    if (String(data.get("current") ?? "").length < 8) next.current = "Enter your current password";
    if (String(data.get("password") ?? "").length < 8) next.password = "New password must be at least 8 characters";
    if (data.get("password") !== data.get("confirm")) next.confirm = "Passwords do not match";
    setErrors(next);
    // Passwords are never handled in the browser layer. Real change-password lives in the backend.
    if (Object.keys(next).length === 0) setNotice("Password changes are handled by the account backend, which isn’t connected yet. Nothing was changed.");
  };

  return (
    <section aria-labelledby="pw-title" className="max-w-md">
      <h2 id="pw-title" className="mb-5 text-2xl font-semibold">Change Password</h2>
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormField label="Current password" name="current" type="password" autoComplete="current-password" required error={errors.current} />
        <FormField label="New password" name="password" type="password" autoComplete="new-password" required error={errors.password} />
        <FormField label="Confirm new password" name="confirm" type="password" autoComplete="new-password" required error={errors.confirm} />
        <Button type="submit">Update password</Button>
        {notice && <p role="status" className="rounded-lg bg-sand-50 p-3 text-sm text-clay-600">{notice}</p>}
      </form>
    </section>
  );
}
