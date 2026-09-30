import "server-only";
import { site } from "@/config/site";
import { demoRepository } from "./demo";
import { httpRepository } from "./http";
import type { Repository } from "./types";

/** Server-side entry point. Flip NEXT_PUBLIC_DATA_MODE=live to use the backend. */
export const repo: Repository = site.dataMode === "live" ? httpRepository : demoRepository;
export { RepositoryError } from "./types";
