import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __knfSql: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var __knfDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function normalizeDatabaseUrl(rawUrl: string): string {
  const atIndex = rawUrl.lastIndexOf("@");
  if (atIndex === -1) return rawUrl;
  const userInfoStart = rawUrl.indexOf("://");
  if (userInfoStart === -1) return rawUrl;

  const prefix = rawUrl.slice(0, userInfoStart + 3);
  const userInfo = rawUrl.slice(userInfoStart + 3, atIndex);
  const hostAndQuery = rawUrl.slice(atIndex + 1);

  const colonIndex = userInfo.indexOf(":");
  if (colonIndex === -1) return rawUrl;

  const user = userInfo.slice(0, colonIndex);
  const rawPass = userInfo.slice(colonIndex + 1);

  let cleanPass = rawPass;
  try {
    cleanPass = decodeURIComponent(rawPass);
  } catch {
    // fallback
  }

  return `${prefix}${user}:${encodeURIComponent(cleanPass)}@${hostAndQuery}`;
}

export function isTransactionPooler(rawUrl = process.env.DATABASE_URL ?? ""): boolean {
  return rawUrl.includes("pooler.supabase.com") || rawUrl.includes(":6543");
}

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for booking operations.");
  }

  if (!globalThis.__knfSql) {
    const isProd = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
    const connectionUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
    const isSupabasePooler = isTransactionPooler(connectionUrl);

    globalThis.__knfSql = postgres(connectionUrl, {
      max: 15,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
      ssl: isProd || isSupabasePooler ? "require" : undefined,
    });
  }

  return globalThis.__knfSql;
}

export function getDb() {
  if (!globalThis.__knfDb) {
    globalThis.__knfDb = drizzle(getSql(), { schema });
  }
  return globalThis.__knfDb;
}
