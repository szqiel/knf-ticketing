import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { getDb, getSql, isTransactionPooler } from "@/lib/db/client";
import { blockedSeats, bookings, films, programs, reservations } from "@/lib/db/schema";
import { CANONICAL_SEATS_BY_ID } from "@/lib/booking/canonical-seats";
import { BookingError } from "@/lib/booking/errors";
import { getSeatMap } from "@/lib/booking/service";
import { isCinemaFrontUnavailable } from "@/lib/booking/seat-layout";

function notifyAdminSeatChange(programId: string) {
  if (isTransactionPooler()) return;
  void getSql()
    .notify("seats_changed", JSON.stringify({ programId, changedAt: new Date().toISOString() }))
    .catch(() => {});
}

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
      subtitle: programs.subtitle,
      description: programs.description,
      dayLabel: programs.dayLabel,
      startsAt: programs.startsAt,
      endsAt: programs.endsAt,
      posterPath: programs.posterPath,
      bookingOpen: programs.bookingOpen,
      isPublished: programs.isPublished,
      sortOrder: programs.sortOrder,
    })
    .from(programs)
    .orderBy(programs.sortOrder, programs.title);
}

export async function getAdminSeatMap(programId: string) {
  const [seatMap, blockedRows] = await Promise.all([
    getSeatMap(programId),
    getDb()
      .select({ seatId: blockedSeats.seatId, reason: blockedSeats.reason })
      .from(blockedSeats)
      .where(eq(blockedSeats.programId, programId)),
  ]);
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
  const seat = CANONICAL_SEATS_BY_ID.get(seatId);
  if (!seat) throw new BookingError("That seat does not exist.", "SEAT_NOT_FOUND");
  if (isCinemaFrontUnavailable(seat.rowName, seat.number) && !blocked) {
    throw new BookingError("Fixed front seats cannot be unblocked.", "SEAT_BLOCKED");
  }

  const [[program], [activeReservation]] = await Promise.all([
    db.select({ id: programs.id }).from(programs).where(eq(programs.id, programId)).limit(1),
    db
      .select({ status: reservations.status })
      .from(reservations)
      .where(
        and(
          eq(reservations.programId, programId),
          eq(reservations.seatId, seatId),
        ),
      )
      .limit(1),
  ]);
  if (!program) throw new BookingError("That program does not exist.", "PROGRAM_NOT_FOUND");
  if (blocked && (activeReservation?.status === "held" || activeReservation?.status === "booked")) {
    throw new BookingError("Cannot block a held or booked seat.", "SEAT_UNAVAILABLE");
  }

  if (blocked) {
    await db.insert(blockedSeats).values({ programId, seatId, reason: reason.trim() || "Blocked by staff" }).onConflictDoNothing();
  } else {
    await db.delete(blockedSeats).where(and(eq(blockedSeats.programId, programId), eq(blockedSeats.seatId, seatId)));
  }

  notifyAdminSeatChange(programId);
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
      seatId: reservations.seatId,
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
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(bookings.createdAt));

  return rows.map((row) => ({
    bookingId: row.bookingId,
    programId: row.programId,
    programTitle: row.programTitle,
    seatLabel: row.seatId ? (CANONICAL_SEATS_BY_ID.get(row.seatId)?.label ?? row.seatId) : null,
    fullName: row.fullName,
    contact: row.contact,
    status: row.status,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
    cancelledAt: row.cancelledAt?.toISOString() ?? null,
    cancelledReason: row.cancelledReason,
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
    notifyAdminSeatChange(programId);
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

export async function deleteBookingAsAdmin(programId: string, bookingId: string) {
  const result = await getDb().transaction(async (tx) => {
    const [booking] = await tx
      .select({ id: bookings.id })
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.programId, programId)))
      .limit(1);
    if (!booking) throw new BookingError("That booking does not exist.", "BOOKING_NOT_FOUND");

    await tx.delete(reservations).where(eq(reservations.bookingId, bookingId));
    await tx.delete(bookings).where(eq(bookings.id, bookingId));
    return { deleted: true };
  });

  if (result.deleted) {
    notifyAdminSeatChange(programId);
  }
  return result;
}

export async function purgeBookingsAsAdmin(programId?: string) {
  const db = getDb();
  await db.transaction(async (tx) => {
    if (programId && programId !== "all") {
      await tx.delete(reservations).where(eq(reservations.programId, programId));
      await tx.delete(bookings).where(eq(bookings.programId, programId));
    } else {
      await tx.delete(reservations);
      await tx.delete(bookings);
    }
  });

  notifyAdminSeatChange(programId ?? "all");
  return { purged: true };
}

export async function updateProgram(
  programId: string,
  data: {
    title?: string;
    subtitle?: string;
    description?: string;
    dayLabel?: string;
    startsAt?: string;
    endsAt?: string;
    posterPath?: string;
    bookingOpen?: boolean;
    isPublished?: boolean;
    sortOrder?: number;
  },
) {
  const db = getDb();
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.subtitle !== undefined) updateData.subtitle = data.subtitle.trim();
  if (data.description !== undefined) updateData.description = data.description.trim();
  if (data.dayLabel !== undefined) updateData.dayLabel = data.dayLabel.trim();
  if (data.startsAt !== undefined) updateData.startsAt = data.startsAt.trim();
  if (data.endsAt !== undefined) updateData.endsAt = data.endsAt.trim();
  if (data.posterPath !== undefined) updateData.posterPath = data.posterPath.trim();
  if (data.bookingOpen !== undefined) updateData.bookingOpen = data.bookingOpen;
  if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

  const [updated] = await db
    .update(programs)
    .set(updateData)
    .where(eq(programs.id, programId))
    .returning();

  if (!updated) throw new BookingError("Program not found.", "PROGRAM_NOT_FOUND");
  notifyAdminSeatChange(programId);
  return updated;
}

export async function toggleProgramBooking(programId: string, bookingOpen: boolean) {
  return updateProgram(programId, { bookingOpen });
}

export async function listFilmsForProgram(programId: string) {
  return getDb()
    .select()
    .from(films)
    .where(eq(films.programId, programId))
    .orderBy(asc(films.sortOrder), asc(films.createdAt));
}

export async function createFilm(
  programId: string,
  data: {
    title: string;
    director?: string;
    durationMin?: number;
    origin?: string;
    synopsis?: string;
    posterPath?: string;
    stillPath?: string;
  },
) {
  const db = getDb();
  const existing = await db
    .select({ sortOrder: films.sortOrder })
    .from(films)
    .where(eq(films.programId, programId))
    .orderBy(desc(films.sortOrder))
    .limit(1);

  const nextOrder = existing.length > 0 ? (existing[0].sortOrder ?? 0) + 1 : 1;

  const [created] = await db
    .insert(films)
    .values({
      programId,
      title: data.title.trim(),
      director: data.director?.trim() || null,
      durationMin: data.durationMin ?? null,
      origin: data.origin?.trim() || null,
      synopsis: data.synopsis?.trim() || null,
      posterPath: data.posterPath?.trim() || null,
      stillPath: data.stillPath?.trim() || null,
      sortOrder: nextOrder,
    })
    .returning();

  return created;
}

export async function updateFilm(
  filmId: string,
  data: Partial<{
    title: string;
    director: string;
    durationMin: number;
    origin: string;
    synopsis: string;
    posterPath: string;
    stillPath: string;
  }>,
) {
  const db = getDb();
  const [updated] = await db
    .update(films)
    .set({
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.director !== undefined ? { director: data.director?.trim() || null } : {}),
      ...(data.durationMin !== undefined ? { durationMin: data.durationMin } : {}),
      ...(data.origin !== undefined ? { origin: data.origin?.trim() || null } : {}),
      ...(data.synopsis !== undefined ? { synopsis: data.synopsis?.trim() || null } : {}),
      ...(data.posterPath !== undefined ? { posterPath: data.posterPath?.trim() || null } : {}),
      ...(data.stillPath !== undefined ? { stillPath: data.stillPath?.trim() || null } : {}),
    })
    .where(eq(films.id, filmId))
    .returning();

  if (!updated) throw new BookingError("Film not found.", "FILM_NOT_FOUND");
  return updated;
}

export async function deleteFilm(filmId: string) {
  const db = getDb();
  const [deleted] = await db.delete(films).where(eq(films.id, filmId)).returning();
  if (!deleted) throw new BookingError("Film not found.", "FILM_NOT_FOUND");
  return deleted;
}

export async function reorderFilms(programId: string, filmIdsInOrder: string[]) {
  const db = getDb();
  await db.transaction(async (tx) => {
    for (let i = 0; i < filmIdsInOrder.length; i++) {
      await tx
        .update(films)
        .set({ sortOrder: i + 1 })
        .where(and(eq(films.id, filmIdsInOrder[i]), eq(films.programId, programId)));
    }
  });
  return listFilmsForProgram(programId);
}

export async function getFestivalKpis() {
  const rawSql = getSql();
  const [row] = await rawSql<
    {
      total_programs: number;
      open_programs_count: number;
      total_bookings: number;
      valid_bookings: number;
      cancelled_bookings: number;
    }[]
  >`
    SELECT
      (SELECT count(*)::int FROM program) AS total_programs,
      (SELECT count(*)::int FROM program WHERE booking_open = true) AS open_programs_count,
      (SELECT count(*)::int FROM booking) AS total_bookings,
      (SELECT count(*)::int FROM booking WHERE status = 'booked') AS valid_bookings,
      (SELECT count(*)::int FROM booking WHERE status = 'cancelled') AS cancelled_bookings
  `;

  return {
    totalPrograms: row?.total_programs ?? 0,
    openProgramsCount: row?.open_programs_count ?? 0,
    totalBookings: row?.total_bookings ?? 0,
    validBookings: row?.valid_bookings ?? 0,
    cancelledBookings: row?.cancelled_bookings ?? 0,
  };
}
