import { NextResponse } from "next/server";
import { site } from "@/config/site";
import { jsonError, parseBody, rateLimited } from "@/lib/api";
import { contactSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (rateLimited(request, "contact", 5)) return jsonError("RATE_LIMITED", "Too many messages. Please try again later.", 429);
  const parsed = await parseBody(request, contactSchema);
  if ("response" in parsed) return parsed.response;
  if (site.dataMode === "demo") return NextResponse.json({ ok: true, persisted: false, message: "Demo mode: your message was validated but not sent." });
  return jsonError("NOT_IMPLEMENTED", "Connect the contact form to your support inbox or helpdesk in the backend.", 501);
}
