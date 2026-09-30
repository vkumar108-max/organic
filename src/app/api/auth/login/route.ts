import { jsonError } from "@/lib/api";

/**
 * Authentication is intentionally NOT faked here. Implement it in the shared
 * backend (hashed passwords with argon2/bcrypt, httpOnly + Secure + SameSite
 * session cookies or short-lived JWTs) and proxy to it from this route.
 */
export async function POST() {
  return jsonError("AUTH_NOT_CONFIGURED", "Sign-in is not connected to a backend yet.", 501);
}
