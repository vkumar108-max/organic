"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "loading" | "success" | "error";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? "Something went wrong.");
      setStatus("success");
      setMessage(data.message);
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Network error. Please try again.");
    }
  };

  return (
    <section aria-labelledby="newsletter-title" className="section">
      <div className="container-page">
        <div className="rounded-3xl bg-brand-700 px-6 py-12 text-center text-white sm:px-12">
          <h2 id="newsletter-title" className="text-3xl font-semibold text-white">Stay Connected With Us</h2>
          <p className="mx-auto mt-2 max-w-md text-brand-100">Get product updates, offers and useful information.</p>
          <form onSubmit={submit} noValidate className="mx-auto mt-6 flex max-w-lg flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              aria-describedby="newsletter-status"
              className="min-h-12 flex-1 rounded-full border-0 bg-white px-5 text-ink placeholder:text-ink-soft/70"
            />
            <Button type="submit" size="lg" variant="secondary" disabled={status === "loading"}>{status === "loading" ? "Subscribing…" : "Subscribe"}</Button>
          </form>
          <p id="newsletter-status" role="status" className={`mt-3 min-h-6 text-sm ${status === "error" ? "text-red-200" : "text-brand-100"}`}>{message}</p>
        </div>
      </div>
    </section>
  );
}
