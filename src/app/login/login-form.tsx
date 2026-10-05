"use client";

import { useActionState } from "react";
import { loginAction } from "@/server/auth/login";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-controls";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      <Field label="Email" htmlFor="email"><Input id="email" name="email" type="email" autoComplete="username" required autoFocus /></Field>
      <Field label="Password" htmlFor="password"><Input id="password" name="password" type="password" autoComplete="current-password" required /></Field>
      {state?.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <Button type="submit" loading={pending} className="w-full">Sign in</Button>
    </form>
  );
}
