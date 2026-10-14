import { and, desc, eq, gte, lt } from "drizzle-orm";
import { getDb, getSql } from "@/lib/db/client";
import { blockedSeats, bookings, programs, reservations, seats } from "@/lib/db/schema";
import { BookingError } from "@/lib/booking/errors";
import { getSeatMap } from "@/lib/booking/service";
import { isCinemaFrontUnavailable } from "@/lib/booking/seat-layout";

export type AudienceFilters = {
  programId?: string;
  from?: string;
  to?: string;
};

export async function getAdminPrograms() {
  return getDb()
    .select({
      id: programs.id,
      slug: programs.slug,
      title: programs.title,
      dayLabel: programs.dayLabel,
      bookingOpen: programs.bookingOpen,
    })
    .from(programs)
    .orderBy(programs.sortOrder, programs.title);
}

export async function getAdminSeatMap(programId: string) {
  const seatMap = await getSeatMap(programId);
  const blockedRows = await getDb()
    .select({ seatId: blockedSeats.seatId, reason: blockedSeats.reason })
    .from(blockedSeats)
    .where(eq(blockedSeats.programId, programId));
  const reasons = new Map(blockedRows.map((row) => [row.seatId, row.reason]));

  return {
    ...seatMap,
    seats: seatMap.seats.map((seat) => ({
      ...seat,
      fixedBlocked: isCinemaFrontUnavailable(seat.rowName, seat.number),
      blockedReason: reasons.get(seat.id) ?? null,
    })),
  };
}

export async function setSeatBlocked(
  programId: string,
  seatId: string,
  blocked: boolean,
  reason = "Blocked by staff",
) {
  const db = getDb();
  const [seat] = await db.select().from(seats).where(eq(seats.id, seatId)).limit(1);
  if (!seat) throw new BookingError("That seat does not exist.", "SEAT_NOT_FOUND");
  if (isCinemaFrontUnavailable(seat.rowName, seat.number) && !blocked) {
    throw new BookingError("Fixed front seats cannot be unblocked.", "SEAT_BLOCKED");
  }

  const [program] = await db.select({ id: programs.id }).from(programs).where(eq(programs.id, programId)).limit(1);
  if (!program) throw new BookingError("That program does not exist.", "PROGRAM_NOT_FOUND");

  const [activeReservation] = await db
    .select({ status: reservations.status })
    .from(reservations)
    .where(
      and(
        eq(reservations.programId, programId),
        eq(reservations.seatId, seatId),
      ),
    )
    .limit(1);
  if (blocked && (activeReservation?.status === "held" || activeReservation?.status === "booked")) {
    throw new BookingError("Cannot block a held or booked seat.", "SEAT_UNAVAILABLE");
  }

  if (blocked) {
    await db.insert(blockedSeats).values({ programId, seatId, reason: reason.trim() || "Blocked by staff" }).onConflictDoNothing();
  } else {
    await db.delete(blockedSeats).where(and(eq(blockedSeats.programId, programId), eq(blockedSeats.seatId, seatId)));
  }

  await getSql().notify("seats_changed", JSON.stringify({ programId, changedAt: new Date().toISOString() }));
  return getAdminSeatMap(programId);
}

export async function listAudience({ programId, from, to }: AudienceFilters = {}) {
  const conditions = [];
  if (programId) conditions.push(eq(bookings.programId, programId));
  if (from) conditions.push(gte(bookings.createdAt, new Date(`${from}T00:00:00.000Z`)));
  if (to) {
    conditions.push(
      lt(
        bookings.createdAt,
        new Date(new Date(`${to}T00:00:00.000Z`).getTime() + 24 * 60 * 60 * 1000),
      ),
    );
  }

  const rows = await getDb()
    .select({
      bookingId: bookings.id,
      programId: programs.id,
      programTitle: programs.title,
      seatLabel: seats.label,
      fullName: bookings.fullName,
      contact: bookings.contact,
      status: bookings.status,
      source: bookings.source,
      createdAt: bookings.createdAt,
      cancelledAt: bookings.cancelledAt,
      cancelledReason: bookings.cancelledReason,
    })
    .from(bookings)
    .innerJoin(programs, eq(programs.id, bookings.programId))
    .leftJoin(reservations, eq(reservations.bookingId, bookings.id))
    .leftJoin(seats, eq(seats.id, reservations.seatId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(bookings.createdAt));

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    cancelledAt: row.cancelledAt?.toISOString() ?? null,
  }));
}

export async function cancelBookingAsAdmin(programId: string, bookingId: string, reason = "Cancelled by staff") {
  const now = new Date();
  const result = await getDb().transaction(async (tx) => {
    const [booking] = await tx
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.programId, programId)))
      .for("update")
      .limit(1);
    if (!booking) throw new BookingError("That booking does not exist.", "BOOKING_NOT_FOUND");
    if (booking.status === "cancelled") return { cancelled: false };

    await tx
      .update(bookings)
      .set({ status: "cancelled", cancelledAt: now, cancelledReason: reason.trim() || "Cancelled by staff" })
      .where(eq(bookings.id, bookingId));
    await tx
      .update(reservations)
      .set({ status: "cancelled", updatedAt: now })
      .where(and(eq(reservations.bookingId, bookingId), eq(reservations.status, "booked")));
    return { cancelled: true };
  });

  if (result.cancelled) {
    await getSql().notify("seats_changed", JSON.stringify({ programId, changedAt: now.toISOString() }));
  }
  return result;
}

export async function getReportRows(filters: AudienceFilters = {}) {
  const rows = await listAudience(filters);
  return {
    rows,
    summary: {
      total: rows.length,
      valid: rows.filter((row) => row.status === "booked").length,
      cancelled: rows.filter((row) => row.status === "cancelled").length,
    },
  };
}
