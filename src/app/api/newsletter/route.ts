import { NextResponse } from "next/server";
import { site } from "@/config/site";
import { jsonError, parseBody, rateLimited } from "@/lib/api";
import { newsletterSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (rateLimited(request, "newsletter", 5)) return jsonError("RATE_LIMITED", "Too many attempts. Please try again later.", 429);
  const parsed = await parseBody(request, newsletterSchema);
  if ("response" in parsed) return parsed.response;
  // Connect your email provider here (e.g. via NEWSLETTER_PROVIDER_API_KEY). Never log emails in production.
  if (site.dataMode === "demo") {
    return NextResponse.json({ ok: true, persisted: false, message: "Demo mode: thanks! Your email was not stored." });
  }
  if (!process.env.NEWSLETTER_PROVIDER_API_KEY) return jsonError("NOT_CONFIGURED", "Newsletter sign-up isn’t available right now.", 503);
  return jsonError("NOT_IMPLEMENTED", "Newsletter provider adapter has not been implemented yet.", 501);
}
