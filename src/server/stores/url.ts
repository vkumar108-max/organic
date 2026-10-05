import "server-only";
import { env } from "@/lib/env";

/** Public storefront URL for a store slug (preview link only; the storefront is a separate product). */
export const storeUrl = (slug: string) => `https://${slug}.${env.storefrontBaseDomain}`;
