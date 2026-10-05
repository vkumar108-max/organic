import { describe, expect, it } from "vitest";
import { canTransition } from "../src/server/sellers/transitions";
import { canStoreTransition } from "../src/server/stores/transitions";
import { rangeWindow, parseRange } from "../src/server/analytics/range";
import { parseListParams } from "../src/lib/list-params";
import { ALL_PERMISSION_KEYS } from "../src/config/permissions";
import { SYSTEM_ROLES } from "../src/config/roles";
import { NAV_ITEMS } from "../src/config/nav";

describe("seller state machine", () => {
  it("only approves pending/rejected sellers", () => {
    expect(canTransition("approve", "PENDING")).toBe(true);
    expect(canTransition("approve", "BLOCKED")).toBe(false);
  });
  it("only reactivates suspended/blocked sellers", () => {
    expect(canTransition("reactivate", "SUSPENDED")).toBe(true);
    expect(canTransition("reactivate", "ACTIVE")).toBe(false);
  });
  it("store can't be suspended unless active", () => {
    expect(canStoreTransition("suspend", "DRAFT")).toBe(false);
    expect(canStoreTransition("suspend", "ACTIVE")).toBe(true);
  });
});

describe("range windows", () => {
  const now = new Date("2026-10-05T14:30:00Z");
  it("buckets", () => {
    expect(rangeWindow("today", now).buckets).toHaveLength(15);
    expect(rangeWindow("7d", now).buckets).toHaveLength(7);
    expect(rangeWindow("30d", now).buckets).toHaveLength(30);
    expect(rangeWindow("1y", now).buckets).toHaveLength(12);
  });
  it("falls back on bad input", () => expect(parseRange("evil'; drop")).toBe("30d"));
});

describe("list params whitelist", () => {
  it("ignores unknown sort keys and clamps page", () => {
    const p = parseListParams({ sort: "passwordHash", page: "-5", dir: "sideways" }, { sortable: ["name"], defaultSort: "name" });
    expect(p.sort).toBe("name");
    expect(p.page).toBe(1);
    expect(p.dir).toBe("desc");
  });
});

describe("RBAC config integrity", () => {
  it("roles only reference real permissions", () => {
    for (const r of SYSTEM_ROLES) for (const k of r.permissions) expect(ALL_PERMISSION_KEYS).toContain(k);
  });
  it("every nav permission exists", () => {
    for (const n of NAV_ITEMS) if (n.permission) expect(ALL_PERMISSION_KEYS).toContain(n.permission);
  });
  it("finance cannot manage settings; theme manager cannot see payouts", () => {
    const get = (k: string) => SYSTEM_ROLES.find((r) => r.key === k)!.permissions as string[];
    expect(get("finance_admin")).not.toContain("settings.manage");
    expect(get("theme_manager")).not.toContain("payouts.view");
  });
});
