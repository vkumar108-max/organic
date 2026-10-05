import "server-only";
import { getSection } from "./service";

export async function getSecuritySettings() {
  const s = await getSection("security");
  return { maxLoginAttempts: Number(s.maxLoginAttempts), lockoutMinutes: Number(s.lockoutMinutes), requireTwoFactor: Boolean(s.requireTwoFactor) };
}
