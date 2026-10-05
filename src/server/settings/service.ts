import "server-only";
import { cache } from "react";
import { db } from "../db";
import { SETTINGS_SECTIONS } from "./definitions";

/** Reads a section, merging stored values over defaults and re-validating (bad stored data falls back). */
export const getSection = cache(async (id: string): Promise<Record<string, unknown>> => {
  const def = SETTINGS_SECTIONS.find((s) => s.id === id);
  if (!def) throw new Error(`Unknown settings section ${id}`);
  const row = await db.platformSetting.findUnique({ where: { key: id } });
  const merged = { ...def.defaults, ...((row?.value as object) ?? {}) };
  const parsed = def.schema.safeParse(merged);
  return parsed.success ? parsed.data : { ...def.defaults };
});
