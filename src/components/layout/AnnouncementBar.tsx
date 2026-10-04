"use client";

import { useEffect, useState } from "react";

/** Thin top bar. Desktop shows every message; mobile rotates one at a time. */
export function AnnouncementBar({ messages }: { messages: string[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setCurrent((value) => (value + 1) % messages.length), 4000);
    return () => clearInterval(timer);
  }, [messages.length]);

  if (messages.length === 0) return null;
  return (
    <div className="bg-brand-800 text-[0.8rem] text-brand-50" role="region" aria-label="Announcements">
      <div className="container-page flex min-h-9 items-center justify-center">
        <ul className="hidden w-full items-center justify-center gap-x-8 md:flex">
          {messages.map((message) => <li key={message}>{message}</li>)}
        </ul>
        <p className="py-2 text-center md:hidden" aria-live="off">{messages[current]}</p>
      </div>
    </div>
  );
}
