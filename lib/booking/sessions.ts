import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { bookingSessions } from "@/lib/db/schema";
import { BookingError } from "./errors";

const SESSION_TTL_MS = 5 * 60 * 1000;

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export async function assertBookingSession(token: string) {
  const [session] = await getDb()
    .select({ id: bookingSessions.id })
    .from(bookingSessions)
    .where(
      and(
        eq(bookingSessions.tokenHash, hashSessionToken(token)),
        gt(bookingSessions.expiresAt, new Date()),
        isNull(bookingSessions.revokedAt),
      ),
    )
    .limit(1);

  if (!session) {
    throw new BookingError("Your booking session has expired.", "SESSION_INVALID");
  }

  return session.id;
}

export async function issueBookingSession(source: "qr" | "kiosk" = "qr") {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const [session] = await getDb()
    .insert(bookingSessions)
    .values({ tokenHash: hashSessionToken(token), source, expiresAt })
    .returning({ id: bookingSessions.id, expiresAt: bookingSessions.expiresAt });

  return { token, ...session };
}
