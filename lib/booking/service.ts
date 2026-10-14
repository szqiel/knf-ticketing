import { createHash, randomUUID } from "node:crypto";
import { and, eq, lt, sql } from "drizzle-orm";
import { bookingRequestSchema, type BookingRequest } from "@/lib/contracts";
import { getDb, getSql } from "@/lib/db/client";
import {
  blockedSeats,
  bookings,
  programs,
  reservations,
  seats,
} from "@/lib/db/schema";
import { BookingError } from "./errors";
import { assertBookingSession } from "./sessions";

const HOLD_TTL_MS = 3 * 60 * 1000;

type DbTransaction = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

function normalizeContact(contact: string) {
  return contact.trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeName(fullName: string) {
  return fullName.trim().replace(/\s+/g, " ");
}

function createDerivedIdempotencyKey(
  programId: string,
  request: BookingRequest,
  sessionId: string,
) {
  return createHash("sha256")
    .update(
      [
        programId,
        request.seatId,
        request.holdToken,
        normalizeName(request.fullName).toLowerCase(),
        normalizeContact(request.contact),
        sessionId,
      ].join("\0"),
    )
    .digest("hex");
}

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

async function notifySeatChange(programId: string) {
  try {
    await getSql().notify(
      "seats_changed",
      JSON.stringify({ programId, changedAt: new Date().toISOString() }),
    );
  } catch (error) {
    // A notification failure must not turn a committed booking into a false error.
    console.error("Unable to publish seat change notification", error);
  }
}

async function notifySeatChanges(programIds: Iterable<string>) {
  await Promise.all([...new Set(programIds)].map((programId) => notifySeatChange(programId)));
}

/**
 * Move expired holds to an auditable terminal state. The reservation row is
 * deliberately retained so a hold expiry is distinguishable from a release.
 * The unique (program, seat) row is reused by the next hold transaction.
 */
async function expireHolds(
  tx: DbTransaction,
  now: Date,
  programId?: string,
) {
  const expired = await tx
    .update(reservations)
    .set({
      status: "expired",
      holdToken: null,
      expiresAt: null,
      updatedAt: now,
    })
    .where(
      and(
        ...(programId ? [eq(reservations.programId, programId)] : []),
        eq(reservations.status, "held"),
        lt(reservations.expiresAt, now),
      ),
    )
    .returning({ programId: reservations.programId });

  return expired.map(({ programId: expiredProgramId }) => expiredProgramId);
}

async function getBookingForIdempotency(
  tx: DbTransaction,
  programId: string,
  idempotencyKey: string,
) {
  const [booking] = await tx
    .select()
    .from(bookings)
    .where(and(eq(bookings.programId, programId), eq(bookings.idempotencyKey, idempotencyKey)))
    .limit(1);

  if (!booking) return undefined;

  const [reservation] = await tx
    .select({ seatId: reservations.seatId })
    .from(reservations)
    .where(eq(reservations.bookingId, booking.id))
    .limit(1);
  const [seat] = reservation
    ? await tx.select().from(seats).where(eq(seats.id, reservation.seatId)).limit(1)
    : [];

  return { booking, reservation, seat };
}

function assertIdempotentRequest(
  existing: NonNullable<Awaited<ReturnType<typeof getBookingForIdempotency>>>,
  request: BookingRequest,
) {
  if (
    existing.booking.status === "cancelled" ||
    !existing.reservation ||
    existing.reservation.seatId !== request.seatId
  ) {
    throw new BookingError("That idempotency key has already been used.", "IDEMPOTENCY_CONFLICT");
  }

  if (
    normalizeName(existing.booking.fullName).toLowerCase() !== normalizeName(request.fullName).toLowerCase() ||
    normalizeContact(existing.booking.contact) !== normalizeContact(request.contact)
  ) {
    throw new BookingError("That idempotency key has already been used.", "IDEMPOTENCY_CONFLICT");
  }
}

function toBookingResponse(
  booking: typeof bookings.$inferSelect,
  seat: typeof seats.$inferSelect,
  programId: string,
) {
  return {
    bookingId: booking.id,
    programId,
    seatId: seat.id,
    seatLabel: seat.label,
    fullName: booking.fullName,
    contact: booking.contact,
    createdAt: booking.createdAt.toISOString(),
  };
}

export async function getSeatMap(programId: string) {
  const db = getDb();
  const now = new Date();
  const expiredProgramIds = await db.transaction(async (tx) => {
    const [program] = await tx.select({ id: programs.id }).from(programs).where(eq(programs.id, programId)).limit(1);
    if (!program) throw new BookingError("That program does not exist.", "PROGRAM_NOT_FOUND");
    return expireHolds(tx, now, programId);
  });
  await notifySeatChanges(expiredProgramIds);

  const [seatRows, reservationRows, blockedRows] = await Promise.all([
    db.select().from(seats),
    db.select().from(reservations).where(eq(reservations.programId, programId)),
    db.select().from(blockedSeats).where(eq(blockedSeats.programId, programId)),
  ]);

  const reservationsBySeat = new Map(reservationRows.map((reservation) => [reservation.seatId, reservation]));
  const blockedSeatIds = new Set(blockedRows.map((blocked) => blocked.seatId));

  return {
    programId,
    seats: seatRows.map((seat) => {
      const reservation = reservationsBySeat.get(seat.id);
      const activeStatus = reservation?.status === "held" || reservation?.status === "booked"
        ? reservation.status
        : undefined;
      const status = blockedSeatIds.has(seat.id) ? "blocked" : activeStatus ?? "available";

      return {
        ...seat,
        status,
        heldUntil: reservation?.status === "held" ? reservation.expiresAt?.toISOString() ?? null : null,
      };
    }),
    generatedAt: new Date().toISOString(),
  };
}

export async function getSeatMapBySlug(slug: string) {
  const [program] = await getDb()
    .select({ id: programs.id })
    .from(programs)
    .where(eq(programs.slug, slug))
    .limit(1);

  if (!program) throw new BookingError("That program does not exist.", "PROGRAM_NOT_FOUND");
  return getSeatMap(program.id);
}

export async function holdSeat(programId: string, seatId: string, sessionToken: string) {
  await assertBookingSession(sessionToken);
  const db = getDb();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + HOLD_TTL_MS);
  const changedProgramIds = new Set<string>([programId]);

  try {
    const result = await db.transaction(async (tx) => {
      for (const expiredProgramId of await expireHolds(tx, now)) changedProgramIds.add(expiredProgramId);

      const [program] = await tx.select().from(programs).where(eq(programs.id, programId)).limit(1);
      if (!program) throw new BookingError("That program does not exist.", "PROGRAM_NOT_FOUND");
      if (!program.bookingOpen) {
        throw new BookingError("Booking is not open for this program.", "PROGRAM_CLOSED");
      }

      const [seat] = await tx.select().from(seats).where(eq(seats.id, seatId)).limit(1);
      if (!seat) throw new BookingError("That seat does not exist.", "SEAT_NOT_FOUND");

      const [blocked] = await tx
        .select({ id: blockedSeats.id })
        .from(blockedSeats)
        .where(and(eq(blockedSeats.programId, programId), eq(blockedSeats.seatId, seatId)))
        .limit(1);
      if (blocked) throw new BookingError("That seat is unavailable.", "SEAT_BLOCKED");

      // Lock the canonical row when it exists. This serializes reuse of an
      // expired/released/cancelled seat and the booked transition.
      const [existing] = await tx
        .select()
        .from(reservations)
        .where(and(eq(reservations.programId, programId), eq(reservations.seatId, seatId)))
        .for("update")
        .limit(1);

      if (existing?.status === "held" && existing.expiresAt && existing.expiresAt > now) {
        throw new BookingError("That seat was just selected by someone else.", "SEAT_UNAVAILABLE");
      }
      if (existing?.status === "booked") {
        throw new BookingError("That seat was just selected by someone else.", "SEAT_UNAVAILABLE");
      }

      const values = {
        programId,
        seatId,
        status: "held" as const,
        holdToken: randomUUID(),
        expiresAt,
        bookingId: null,
        updatedAt: now,
      };
      const [reservation] = existing
        ? await tx.update(reservations).set(values).where(eq(reservations.id, existing.id)).returning()
        : await tx.insert(reservations).values(values).returning();

      return { reservation, seat };
    });

    await notifySeatChanges(changedProgramIds);
    return {
      reservationId: result.reservation.id,
      holdToken: result.reservation.holdToken!,
      seatId: result.seat.id,
      expiresAt: result.reservation.expiresAt!.toISOString(),
    };
  } catch (error) {
    if (error instanceof BookingError) throw error;
    if (isUniqueViolation(error)) {
      throw new BookingError("That seat was just selected by someone else.", "SEAT_UNAVAILABLE");
    }
    throw error;
  }
}

export async function confirmBooking(
  programId: string,
  request: BookingRequest,
  source: "kiosk" | "phone" = "phone",
) {
  const parsedRequest = bookingRequestSchema.parse(request);
  const sessionId = await assertBookingSession(parsedRequest.sessionToken);
  const idempotencyKey = parsedRequest.idempotencyKey ?? createDerivedIdempotencyKey(programId, parsedRequest, sessionId);
  const db = getDb();
  const now = new Date();
  const changedProgramIds = new Set<string>([programId]);

  const result = await db.transaction(async (tx) => {
    for (const expiredProgramId of await expireHolds(tx, now, programId)) changedProgramIds.add(expiredProgramId);

    const [program] = await tx.select().from(programs).where(eq(programs.id, programId)).limit(1);
    if (!program) throw new BookingError("That program does not exist.", "PROGRAM_NOT_FOUND");

    const initialExisting = await getBookingForIdempotency(tx, programId, idempotencyKey);
    if (initialExisting) {
      assertIdempotentRequest(initialExisting, parsedRequest);
      if (!initialExisting.seat) throw new BookingError("The existing booking has no seat.", "IDEMPOTENCY_CONFLICT");
      return { booking: initialExisting.booking, seat: initialExisting.seat, idempotent: true };
    }
    if (!program.bookingOpen) throw new BookingError("Booking is not open for this program.", "PROGRAM_CLOSED");

    const [reservation] = await tx
      .select()
      .from(reservations)
      .where(and(eq(reservations.programId, programId), eq(reservations.seatId, parsedRequest.seatId)))
      .for("update")
      .limit(1);

    // A concurrent retry may have committed while this request waited for the
    // seat row. Re-check after the lock so double-clicks return the same ticket.
    const lockedExisting = await getBookingForIdempotency(tx, programId, idempotencyKey);
    if (lockedExisting) {
      assertIdempotentRequest(lockedExisting, parsedRequest);
      if (!lockedExisting.seat) throw new BookingError("The existing booking has no seat.", "IDEMPOTENCY_CONFLICT");
      return { booking: lockedExisting.booking, seat: lockedExisting.seat, idempotent: true };
    }

    const [seat] = await tx.select().from(seats).where(eq(seats.id, parsedRequest.seatId)).limit(1);
    if (!seat) throw new BookingError("That seat does not exist.", "SEAT_NOT_FOUND");
    if (!reservation || reservation.status !== "held" || reservation.holdToken !== parsedRequest.holdToken) {
      throw new BookingError("Your seat hold is no longer valid.", "HOLD_INVALID");
    }
    if (!reservation.expiresAt || reservation.expiresAt <= now) {
      throw new BookingError("Your seat hold has expired.", "HOLD_EXPIRED");
    }

    const [personBooking] = await tx
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.programId, programId),
          eq(bookings.status, "booked"),
          sql`lower(trim(${bookings.contact})) = ${normalizeContact(parsedRequest.contact)}`,
        ),
      )
      .limit(1);
    if (personBooking) {
      throw new BookingError("This contact already has a booking for this program.", "PERSON_ALREADY_BOOKED");
    }

    const [booking] = await tx
      .insert(bookings)
      .values({
        programId,
        fullName: normalizeName(parsedRequest.fullName),
        contact: parsedRequest.contact.trim(),
        source,
        idempotencyKey,
        bookingSessionId: sessionId,
      })
      .returning();

    await tx
      .update(reservations)
      .set({ status: "booked", bookingId: booking.id, holdToken: null, expiresAt: null, updatedAt: now })
      .where(eq(reservations.id, reservation.id));

    return { booking, seat, idempotent: false };
  }).catch((error: unknown) => {
    if (isUniqueViolation(error)) {
      throw new BookingError("That idempotency key has already been used.", "IDEMPOTENCY_CONFLICT");
    }
    throw error;
  });

  if (!result.idempotent) await notifySeatChanges(changedProgramIds);
  return toBookingResponse(result.booking, result.seat, programId);
}

export async function releaseHold(programId: string, seatId: string, holdToken: string, sessionToken: string) {
  await assertBookingSession(sessionToken);
  const now = new Date();
  const releaseResult = await getDb().transaction(async (tx) => {
    const expired = await expireHolds(tx, now, programId);
    const released = await tx
      .update(reservations)
      .set({ status: "released", holdToken: null, expiresAt: null, updatedAt: now })
      .where(
        and(
          eq(reservations.programId, programId),
          eq(reservations.seatId, seatId),
          eq(reservations.holdToken, holdToken),
          eq(reservations.status, "held"),
        ),
      )
      .returning({ id: reservations.id });
    return { expired, released };
  });

  if (releaseResult.released.length > 0 || releaseResult.expired.length > 0) await notifySeatChange(programId);
  return { released: releaseResult.released.length > 0 };
}

export async function cancelBooking(
  programId: string,
  bookingId: string,
  sessionToken: string,
  reason = "Cancelled by attendee",
) {
  const sessionId = await assertBookingSession(sessionToken);
  const now = new Date();
  const result = await getDb().transaction(async (tx) => {
    const [booking] = await tx
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.programId, programId)))
      .for("update")
      .limit(1);
    if (!booking) throw new BookingError("That booking does not exist.", "BOOKING_NOT_FOUND");
    if (booking.bookingSessionId !== sessionId) {
      throw new BookingError("That booking does not belong to this session.", "BOOKING_NOT_FOUND");
    }
    if (booking.status === "cancelled") return { cancelled: false };

    await tx
      .update(bookings)
      .set({ status: "cancelled", cancelledAt: now, cancelledReason: reason.trim() || "Cancelled by attendee" })
      .where(eq(bookings.id, bookingId));
    await tx
      .update(reservations)
      .set({ status: "cancelled", updatedAt: now })
      .where(and(eq(reservations.bookingId, bookingId), eq(reservations.status, "booked")));

    return { cancelled: true };
  });

  if (result.cancelled) await notifySeatChange(programId);
  return result;
}
