"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useAuth } from "@/store/auth";
import { useUi } from "@/store/ui";

export default function DetailsPage() {
  const user = useAuth((state) => state.user);
  const signInDemo = useAuth((state) => state.signInDemo);
  const notify = useUi((state) => state.notify);
  const [error, setError] = useState<string>();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (name.length < 2) return setError("Enter your name");
    setError(undefined);
    if (user) signInDemo(name, user.email);
    notify("Details updated on this device");
  };

  return (
    <section aria-labelledby="details-title" className="max-w-md">
      <h2 id="details-title" className="mb-5 text-2xl font-semibold">Account Details</h2>
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormField label="Full name" name="name" defaultValue={user?.name} error={error} required />
        <FormField label="Email" name="email" value={user?.email ?? ""} readOnly hint="Email changes are handled by the account backend." />
        <Button type="submit">Save changes</Button>
      </form>
    </section>
  );
}
