import "server-only";
import { headers } from "next/headers";

/** IP / UA of the current request. Assumes a trusted reverse proxy sets x-forwarded-for. */
export async function getRequestInfo() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  return { ip, userAgent: h.get("user-agent")?.slice(0, 300) ?? null };
}
