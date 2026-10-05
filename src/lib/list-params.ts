import { DEFAULT_PAGE_SIZE } from "@/config/app";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type ListParams = {
  q: string;
  page: number;
  pageSize: number;
  sort: string;
  dir: "asc" | "desc";
  filters: Record<string, string>;
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/**
 * Parse URL search params into validated list parameters. `sortable` is a whitelist: anything not in
 * it falls back to the default, so user input never reaches an ORDER BY unchecked.
 */
export function parseListParams(
  raw: RawSearchParams,
  opts: { sortable: string[]; defaultSort: string; defaultDir?: "asc" | "desc"; filters?: string[]; pageSize?: number },
): ListParams {
  const sort = opts.sortable.includes(first(raw.sort)) ? first(raw.sort) : opts.defaultSort;
  const dirRaw = first(raw.dir);
  const dir = dirRaw === "asc" || dirRaw === "desc" ? dirRaw : opts.defaultDir ?? "desc";
  const page = Math.max(1, Math.min(10_000, parseInt(first(raw.page), 10) || 1));
  const filters: Record<string, string> = {};
  for (const f of opts.filters ?? []) {
    const v = first(raw[f]).trim();
    if (v) filters[f] = v.slice(0, 100);
  }
  return { q: first(raw.q).trim().slice(0, 100), page, pageSize: opts.pageSize ?? DEFAULT_PAGE_SIZE, sort, dir, filters };
}

export const pageArgs = (p: ListParams) => ({ skip: (p.page - 1) * p.pageSize, take: p.pageSize });

/** Validate that a filter value is a member of an enum; returns undefined otherwise. */
export function enumFilter<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

export type Paged<T> = { rows: T[]; total: number; page: number; pageSize: number };

/** Build a list URL preserving current params, applying overrides ("" removes a key). */
export function listHref(basePath: string, p: ListParams, overrides: Record<string, string | number | undefined> = {}) {
  const sp = new URLSearchParams();
  if (p.q) sp.set("q", p.q);
  for (const [k, v] of Object.entries(p.filters)) sp.set(k, v);
  sp.set("sort", p.sort);
  sp.set("dir", p.dir);
  if (p.page > 1) sp.set("page", String(p.page));
  for (const [k, v] of Object.entries(overrides)) {
    if (v === undefined || v === "") sp.delete(k);
    else sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `${basePath}?${s}` : basePath;
}
