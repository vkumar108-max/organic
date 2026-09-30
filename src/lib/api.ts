import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { fieldErrors } from "@/lib/validation";
import { RepositoryError } from "@/lib/data/types";
import type { ApiError } from "@/types";

export const jsonError = (code: string, message: string, status: number, fields?: Record<string, string>) =>
  NextResponse.json<ApiError>({ error: { code, message, fields } }, { status });

/** Parse + validate a JSON body. Returns either the data or a ready-made 400 response. */
export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<{ data: T } | { response: NextResponse }> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > 50_000) return { response: jsonError("PAYLOAD_TOO_LARGE", "Request body is too large.", 413) };
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { response: jsonError("INVALID_JSON", "Request body must be valid JSON.", 400) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { response: jsonError("VALIDATION_FAILED", "Please check the highlighted fields.", 400, fieldErrors(parsed.error)) };
  return { data: parsed.data };
}

export function handleError(error: unknown) {
  if (error instanceof RepositoryError) {
    const status = error.status;
    return jsonError(error.code, error.message, status);
  }
  console.error(error);
  return jsonError("INTERNAL", "Something went wrong on our side. Please try again.", 500);
}

/**
 * Minimal per-instance rate limiter to blunt abuse of public write endpoints.
 * Replace with an edge/Redis limiter in production (state is per server instance).
 */
const hits = new Map<string, { count: number; reset: number }>();
export function rateLimited(request: Request, key: string, limit = 20, windowMs = 60_000) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const entry = hits.get(id);
  if (!entry || entry.reset < now) {
    hits.set(id, { count: 1, reset: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}
