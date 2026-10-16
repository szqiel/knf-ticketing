import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { getDb, getSql } from "@/lib/db/client";
import { blockedSeats, bookings, films, programs, reservations, seats } from "@/lib/db/schema";
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

export async function deleteBookingAsAdmin(programId: string, bookingId: string) {
  const result = await getDb().transaction(async (tx) => {
    const [booking] = await tx
      .select({ id: bookings.id })
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.programId, programId)))
      .limit(1);
    if (!booking) throw new BookingError("That booking does not exist.", "BOOKING_NOT_FOUND");

    // Delete reservation associated with booking
    await tx.delete(reservations).where(eq(reservations.bookingId, bookingId));
    // Delete booking record
    await tx.delete(bookings).where(eq(bookings.id, bookingId));
    return { deleted: true };
  });

  if (result.deleted) {
    await getSql().notify("seats_changed", JSON.stringify({ programId, changedAt: new Date().toISOString() }));
  }
  return result;
}

export async function purgeBookingsAsAdmin(programId?: string) {
  const db = getDb();
  await db.transaction(async (tx) => {
    if (programId && programId !== "all") {
      const programBookings = await tx
        .select({ id: bookings.id })
        .from(bookings)
        .where(eq(bookings.programId, programId));
      const bookingIds = programBookings.map((b) => b.id);
      if (bookingIds.length > 0) {
        await tx.delete(reservations).where(eq(reservations.programId, programId));
        await tx.delete(bookings).where(eq(bookings.programId, programId));
      }
    } else {
      // Purge all bookings and all reservation records across all programs
      await tx.delete(reservations);
      await tx.delete(bookings);
    }
  });

  await getSql().notify(
    "seats_changed",
    JSON.stringify({ programId: programId ?? "all", changedAt: new Date().toISOString() }),
  );
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
  await getSql().notify("seats_changed", JSON.stringify({ programId, changedAt: new Date().toISOString() }));
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
  const allPrograms = await getAdminPrograms();
  const allAudience = await listAudience();

  const totalBookings = allAudience.length;
  const validBookings = allAudience.filter((a) => a.status === "booked").length;
  const cancelledBookings = allAudience.filter((a) => a.status === "cancelled").length;
  const openProgramsCount = allPrograms.filter((p) => p.bookingOpen).length;

  return {
    totalPrograms: allPrograms.length,
    openProgramsCount,
    totalBookings,
    validBookings,
    cancelledBookings,
  };
}

