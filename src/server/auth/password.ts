import "server-only";
import bcrypt from "bcryptjs";

const COST = 12;
// Pre-computed hash compared against when the email is unknown, so timing doesn't reveal account existence.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", COST);

export const hashPassword = (plain: string) => bcrypt.hash(plain, COST);

export async function verifyPassword(plain: string, hash: string | null): Promise<boolean> {
  const ok = await bcrypt.compare(plain, hash ?? DUMMY_HASH);
  return hash ? ok : false;
}

/** Password policy enforced when admins are created or change password. */
export function passwordProblems(pw: string): string | null {
  if (pw.length < 12) return "Password must be at least 12 characters.";
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw)) return "Use upper-case, lower-case and a number.";
  return null;
}
