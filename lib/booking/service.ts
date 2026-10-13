import { randomUUID } from "node:crypto";
import { and, eq, isNull, lt } from "drizzle-orm";
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

async function removeExpiredHolds(tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0]) {
  await tx
    .delete(reservations)
    .where(and(eq(reservations.status, "held"), lt(reservations.expiresAt, new Date())));
}

export async function getSeatMap(programId: string) {
  const db = getDb();
  await db
    .delete(reservations)
    .where(and(eq(reservations.programId, programId), eq(reservations.status, "held"), lt(reservations.expiresAt, new Date())));

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
      const status = blockedSeatIds.has(seat.id)
        ? "blocked"
        : reservation?.status ?? "available";

      return {
        ...seat,
        status,
        heldUntil: reservation?.status === "held" ? reservation.expiresAt?.toISOString() ?? null : null,
      };
    }),
    generatedAt: new Date().toISOString(),
  };
}

export async function holdSeat(programId: string, seatId: string, sessionToken: string) {
  await assertBookingSession(sessionToken);
  const db = getDb();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + HOLD_TTL_MS);

  try {
    const result = await db.transaction(async (tx) => {
      await removeExpiredHolds(tx);

      const [program] = await tx.select().from(programs).where(eq(programs.id, programId)).limit(1);
      if (!program?.bookingOpen) {
        throw new BookingError("Booking is not open for this program.", "PROGRAM_CLOSED");
      }

      const [seat] = await tx.select().from(seats).where(eq(seats.id, seatId)).limit(1);
      if (!seat) {
        throw new BookingError("That seat does not exist.", "SEAT_NOT_FOUND");
      }

      const [blocked] = await tx
        .select({ id: blockedSeats.id })
        .from(blockedSeats)
        .where(and(eq(blockedSeats.programId, programId), eq(blockedSeats.seatId, seatId)))
        .limit(1);
      if (blocked) {
        throw new BookingError("That seat is unavailable.", "SEAT_BLOCKED");
      }

      const [existing] = await tx
        .select({ id: reservations.id })
        .from(reservations)
        .where(and(eq(reservations.programId, programId), eq(reservations.seatId, seatId)))
        .limit(1);
      if (existing) {
        throw new BookingError("That seat was just selected by someone else.", "SEAT_UNAVAILABLE");
      }

      const [reservation] = await tx
        .insert(reservations)
        .values({
          programId,
          seatId,
          status: "held",
          holdToken: randomUUID(),
          expiresAt,
        })
        .returning();

      return { reservation, seat };
    });

    await notifySeatChange(programId);
    return {
      reservationId: result.reservation.id,
      holdToken: result.reservation.holdToken!,
      seatId: result.seat.id,
      expiresAt: result.reservation.expiresAt!.toISOString(),
    };
  } catch (error) {
    if (error instanceof BookingError) throw error;
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
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
  await assertBookingSession(parsedRequest.sessionToken);
  const db = getDb();
  const now = new Date();

  const result = await db.transaction(async (tx) => {
    await removeExpiredHolds(tx);

    const [reservation] = await tx
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.programId, programId),
          eq(reservations.seatId, parsedRequest.seatId),
          eq(reservations.holdToken, parsedRequest.holdToken),
          eq(reservations.status, "held"),
        ),
      )
      .limit(1);

    if (!reservation || !reservation.expiresAt || reservation.expiresAt <= now) {
      throw new BookingError("Your seat hold has expired.", "HOLD_EXPIRED");
    }

    const [seat] = await tx.select().from(seats).where(eq(seats.id, parsedRequest.seatId)).limit(1);
    if (!seat) {
      throw new BookingError("That seat does not exist.", "SEAT_NOT_FOUND");
    }

    const [booking] = await tx
      .insert(bookings)
      .values({
        programId,
        fullName: parsedRequest.fullName,
        contact: parsedRequest.contact,
        source,
      })
      .returning();

    await tx
      .update(reservations)
      .set({ status: "booked", bookingId: booking.id, holdToken: null, expiresAt: null, updatedAt: now })
      .where(eq(reservations.id, reservation.id));

    return { booking, seat };
  });

  await notifySeatChange(programId);
  return {
    bookingId: result.booking.id,
    programId,
    seatId: result.seat.id,
    seatLabel: result.seat.label,
    fullName: result.booking.fullName,
    contact: result.booking.contact,
    createdAt: result.booking.createdAt.toISOString(),
  };
}

export async function releaseHold(programId: string, seatId: string, holdToken: string, sessionToken: string) {
  await assertBookingSession(sessionToken);
  const deleted = await getDb()
    .delete(reservations)
    .where(
      and(
        eq(reservations.programId, programId),
        eq(reservations.seatId, seatId),
        eq(reservations.holdToken, holdToken),
        eq(reservations.status, "held"),
      ),
    )
    .returning({ id: reservations.id });

  if (deleted.length > 0) await notifySeatChange(programId);
  return { released: deleted.length > 0 };
}
