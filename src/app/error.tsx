"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** Route-level error boundary: distinguishes offline from server failures. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  const offline = typeof navigator !== "undefined" && !navigator.onLine;
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-red-50 text-danger"><Icon name={offline ? "wifiOff" : "alert"} size={30} /></div>
      <h1 className="text-2xl font-semibold">{offline ? "You appear to be offline" : "Something went wrong"}</h1>
      <p className="mt-2 text-ink-soft">{offline ? "Check your internet connection and try again." : "We couldn’t load this page. Please try again in a moment."}</p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="outline">Go home</Button>
      </div>
    </div>
  );
}
