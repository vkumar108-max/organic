"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    setStatus("loading");
    setErrors({});
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) {
        setErrors(data?.error?.fields ?? {});
        throw new Error(data?.error?.message ?? "Could not send your message.");
      }
      setStatus("done");
      setMessage(data.message ?? "Thank you! We’ll get back to you soon.");
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-describedby="contact-status">
      <FormField label="Your name" name="name" autoComplete="name" required error={errors.name} />
      <FormField label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
      <FormField label="Message" name="message" as="textarea" rows={5} required error={errors.message} />
      <Button type="submit" disabled={status === "loading"}>{status === "loading" ? "Sending…" : "Send message"}</Button>
      <p id="contact-status" role="status" className={status === "error" ? "text-danger" : "text-brand-700"}>{status === "done" || status === "error" ? message : ""}</p>
    </form>
  );
}
