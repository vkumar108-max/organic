import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, type Tx } from "../db";
import { getAuthContext, type AuthContext } from "../rbac/context";
import { writeAudit, type AuditEntry } from "../audit";
import { limiter } from "@/lib/rate-limit";
import type { PermissionKey } from "@/config/permissions";

export type ActionResult<T = undefined> =
  | { ok: true; message: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/** Throw for expected, user-presentable failures (invalid state transition, not found...). */
export class ActionError extends Error {
  constructor(message: string, public fieldErrors?: Record<string, string>) {
    super(message);
  }
}

export type ActionCtx = AuthContext & {
  /** Write an audit entry attributed to the current admin; pass a tx to make it atomic. */
  audit: (entry: Omit<AuditEntry, "actor">, tx?: Tx) => Promise<void>;
  tx: <R>(fn: (tx: Tx) => Promise<R>) => Promise<R>;
};

type Options<S extends z.ZodTypeAny, T> = {
  permission: PermissionKey | PermissionKey[];
  schema: S;
  rateLimit?: { limit: number; windowMs: number };
  handler: (input: z.infer<S>, ctx: ActionCtx) => Promise<string | { message: string; data?: T }>;
};

/**
 * The only way mutations are defined. Order of checks:
 * session -> permission -> rate limit -> validation -> handler (business rules + audit) -> revalidate.
 */
export function createAction<S extends z.ZodTypeAny, T = undefined>(opts: Options<S, T>) {
  return async (raw: unknown): Promise<ActionResult<T>> => {
    const auth = await getAuthContext();
    if (!auth) return { ok: false, message: "Your session has expired. Please sign in again." };
    const needed = Array.isArray(opts.permission) ? opts.permission : [opts.permission];
    if (!needed.every((p) => auth.can(p))) return { ok: false, message: "You don't have permission to do that." };

    if (opts.rateLimit && !limiter.hit(`action:${auth.user.id}:${needed.join(",")}`, opts.rateLimit.limit, opts.rateLimit.windowMs)) {
      return { ok: false, message: "Too many requests. Please slow down." };
    }

    const parsed = opts.schema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".") || "_"] ??= issue.message;
      return { ok: false, message: Object.values(fieldErrors)[0] ?? "Invalid input.", fieldErrors };
    }

    const ctx: ActionCtx = {
      ...auth,
      audit: (entry, tx) => writeAudit({ ...entry, actor: { id: auth.user.id, email: auth.user.email } }, tx ?? db),
      tx: (fn) => db.$transaction(fn),
    };

    try {
      const out = await opts.handler(parsed.data, ctx);
      revalidatePath("/", "layout");
      return typeof out === "string" ? { ok: true, message: out } : { ok: true, ...out };
    } catch (e) {
      if (e instanceof ActionError) return { ok: false, message: e.message, fieldErrors: e.fieldErrors };
      console.error("[action] unexpected error", e); // details stay in server logs
      return { ok: false, message: "Something went wrong. Please try again." };
    }
  };
}

export const idSchema = z.object({ id: z.string().min(1).max(40) });
export const reasonSchema = z.string().trim().max(500).optional();
