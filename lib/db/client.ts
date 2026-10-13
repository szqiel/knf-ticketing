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
    globalThis.__knfSql = postgres(process.env.DATABASE_URL, {
      max: process.env.NODE_ENV === "production" ? 10 : 3,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }

  return globalThis.__knfSql;
}

export function getDb() {
  return drizzle(getSql(), { schema });
}
