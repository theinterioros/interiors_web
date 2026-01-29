import { neon } from "@neondatabase/serverless";
import { env } from "@/lib/env";

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not configured.");
}

type SqlFn = <T = unknown>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<T[]>;

export const sql = neon(env.databaseUrl) as SqlFn;
