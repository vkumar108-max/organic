import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { __prisma?: PrismaClient };

export const db: PrismaClient = (g.__prisma ??= new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
}));

export type Tx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];
export type DbClient = PrismaClient | Tx;
