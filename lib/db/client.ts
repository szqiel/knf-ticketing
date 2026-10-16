import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __knfSql: ReturnType<typeof postgres> | undefined;
}

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for booking operations.");
  }

  if (!globalThis.__knfSql) {
    const isProd = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
    const isSupabasePooler = process.env.DATABASE_URL.includes("pooler.supabase.com") || process.env.DATABASE_URL.includes(":6543");

    globalThis.__knfSql = postgres(process.env.DATABASE_URL, {
      max: isProd ? 2 : 3,
      idle_timeout: 15,
      connect_timeout: 10,
      prepare: !isSupabasePooler && !isProd ? true : false,
      ssl: isProd || isSupabasePooler ? "require" : undefined,
    });
  }

  return globalThis.__knfSql;
}

export function getDb() {
  return drizzle(getSql(), { schema });
}
