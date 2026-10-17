import { createHash, randomUUID } from "node:crypto";
import { and, eq, lt, sql } from "drizzle-orm";
import { bookingRequestSchema, type BookingRequest, type Seat } from "@/lib/contracts";
import { getDb, getSql, isTransactionPooler } from "@/lib/db/client";
import {
  blockedSeats,
  bookings,
  films,
  programs,
  reservations,
  seats,
} from "@/lib/db/schema";
import {
  CANONICAL_SEATS,
  CANONICAL_SEATS_BY_ID,
  FIXED_BLOCKED_FRONT_SEAT_IDS,
  FRONT_SEAT_IDS,
} from "./canonical-seats";
import { BookingError } from "./errors";
import { assertBookingSession, createSessionToken, hashSessionToken } from "./sessions";
import { MOCK_PROGRAMS, type Film, type Program } from "@/lib/data/mock-programs";
import {
  isCinemaFrontUnavailable,
  isFrontCinemaRow,
  isRearCinemaRow,
  isRearRowUnlocked,
  REAR_ROW_UNLOCK_THRESHOLD,
} from "./seat-layout";

const HOLD_TTL_MS = 3 * 60 * 1000;
const SESSION_TTL_MS = 5 * 60 * 1000;

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

function notifySeatChange(programId: string) {
  if (isTransactionPooler()) return;
  void getSql()
    .notify(
      "seats_changed",
      JSON.stringify({ programId, changedAt: new Date().toISOString() }),
    )
    .catch((error) => {
      console.error("Unable to publish seat change notification", error);
    });
}

function notifySeatChanges(programIds: Iterable<string>) {
  if (isTransactionPooler()) return;
  for (const programId of new Set(programIds)) {
    notifySeatChange(programId);
  }
}

/**
 * Move expired holds to an auditable terminal state. The reservation row is
 * deliberately retained so a hold expiry is distinguishable from a release.
 * The unique (program, seat) row is reused by the next hold transaction.
 */
async function expireHolds(
  tx: DbTransaction,
  now: Date,
  programId: string,
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
        eq(reservations.programId, programId),
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

  const seat = reservation
    ? CANONICAL_SEATS_BY_ID.get(reservation.seatId) ??
      (await tx.select().from(seats).where(eq(seats.id, reservation.seatId)).limit(1))[0]
    : undefined;

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
  seat: { id: string; label: string },
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

type ActiveReservationItem = {
  seatId: string;
  status: "held" | "booked";
  expiresAt: string | null;
};

function buildSeatMapFromState(
  programId: string,
  activeReservations: ActiveReservationItem[],
  blockedSeatIdsList: string[],
  generatedAtIso: string,
) {
  const reservationsBySeat = new Map(
    activeReservations.map((reservation) => [reservation.seatId, reservation]),
  );
  const blockedSeatIds = new Set(blockedSeatIdsList);

  let frontOccupiedCount = 0;

  const mappedSeats: Seat[] = CANONICAL_SEATS.map((seat) => {
    const reservation = reservationsBySeat.get(seat.id);
    const activeStatus =
      reservation?.status === "held" || reservation?.status === "booked"
        ? reservation.status
        : undefined;
    const status =
      blockedSeatIds.has(seat.id) || isCinemaFrontUnavailable(seat.rowName, seat.number)
        ? ("blocked" as const)
        : (activeStatus ?? ("available" as const));

    if (isFrontCinemaRow(seat.rowName) && status !== "available") {
      frontOccupiedCount++;
    }

    return {
      ...seat,
      status,
      heldUntil:
        reservation?.status === "held" && reservation.expiresAt
          ? new Date(reservation.expiresAt).toISOString()
          : null,
    };
  });

  const rearUnlocked = isRearRowUnlocked(frontOccupiedCount);

  const finalSeats: Seat[] = rearUnlocked
    ? mappedSeats
    : mappedSeats.map((seat) => {
        if (isRearCinemaRow(seat.rowName)) {
          return {
            ...seat,
            status: "blocked" as const,
          };
        }
        return seat;
      });

  return {
    programId,
    seats: finalSeats,
    generatedAt: generatedAtIso,
  };
}

export async function getSeatMap(programId: string) {
  const rawSql = getSql();

  const [row] = await rawSql<
    {
      program_id: string | null;
      expired_count: number;
      active_reservations: ActiveReservationItem[];
      blocked_seat_ids: string[];
      generated_at: string | Date;
    }[]
  >`
    WITH prog AS (
      SELECT id FROM program WHERE id = ${programId} LIMIT 1
    ),
    expired AS (
      UPDATE reservation
      SET status = 'expired', hold_token = NULL, expires_at = NULL, updated_at = NOW()
      WHERE program_id = ${programId}
        AND status = 'held'
        AND expires_at < NOW()
      RETURNING id
    )
    SELECT
      (SELECT id FROM prog) AS program_id,
      (SELECT count(*)::int FROM expired) AS expired_count,
      COALESCE(
        (SELECT json_agg(json_build_object('seatId', r.seat_id, 'status', r.status, 'expiresAt', r.expires_at))
         FROM reservation r
         WHERE r.program_id = ${programId}
           AND (r.status = 'booked' OR (r.status = 'held' AND r.expires_at >= NOW()))),
        '[]'::json
      ) AS active_reservations,
      COALESCE(
        (SELECT json_agg(b.seat_id)
         FROM blocked_seat b
         WHERE b.program_id = ${programId}),
        '[]'::json
      ) AS blocked_seat_ids,
      NOW() AS generated_at
  `;

  if (!row?.program_id) {
    throw new BookingError("That program does not exist.", "PROGRAM_NOT_FOUND");
  }

  if (row.expired_count > 0) {
    notifySeatChange(programId);
  }

  return buildSeatMapFromState(
    row.program_id,
    row.active_reservations ?? [],
    row.blocked_seat_ids ?? [],
    new Date(row.generated_at).toISOString(),
  );
}

export async function getSeatMapBySlug(slug: string) {
  const rawSql = getSql();

  const [row] = await rawSql<
    {
      program_id: string | null;
      expired_count: number;
      active_reservations: ActiveReservationItem[];
      blocked_seat_ids: string[];
      generated_at: string | Date;
    }[]
  >`
    WITH prog AS (
      SELECT id FROM program WHERE slug = ${slug} LIMIT 1
    ),
    expired AS (
      UPDATE reservation
      SET status = 'expired', hold_token = NULL, expires_at = NULL, updated_at = NOW()
      WHERE program_id = (SELECT id FROM prog)
        AND status = 'held'
        AND expires_at < NOW()
      RETURNING id
    )
    SELECT
      (SELECT id FROM prog) AS program_id,
      (SELECT count(*)::int FROM expired) AS expired_count,
      COALESCE(
        (SELECT json_agg(json_build_object('seatId', r.seat_id, 'status', r.status, 'expiresAt', r.expires_at))
         FROM reservation r
         WHERE r.program_id = (SELECT id FROM prog)
           AND (r.status = 'booked' OR (r.status = 'held' AND r.expires_at >= NOW()))),
        '[]'::json
      ) AS active_reservations,
      COALESCE(
        (SELECT json_agg(b.seat_id)
         FROM blocked_seat b
         WHERE b.program_id = (SELECT id FROM prog)),
        '[]'::json
      ) AS blocked_seat_ids,
      NOW() AS generated_at
  `;

  if (!row?.program_id) {
    throw new BookingError("That program does not exist.", "PROGRAM_NOT_FOUND");
  }

  if (row.expired_count > 0) {
    notifySeatChange(row.program_id);
  }

  return buildSeatMapFromState(
    row.program_id,
    row.active_reservations ?? [],
    row.blocked_seat_ids ?? [],
    new Date(row.generated_at).toISOString(),
  );
}

export async function holdSeat(programId: string, seatId: string, sessionToken?: string) {
  // Fast 0ms in-memory seat check against canonical 506-seat geometry
  const seat = CANONICAL_SEATS_BY_ID.get(seatId);
  if (!seat) {
    throw new BookingError("That seat does not exist.", "SEAT_NOT_FOUND");
  }
  if (isCinemaFrontUnavailable(seat.rowName, seat.number)) {
    throw new BookingError("That seat is unavailable.", "SEAT_BLOCKED");
  }

  const rawSql = getSql();
  const now = new Date();
  const nowIso = now.toISOString();
  const expiresAt = new Date(now.getTime() + HOLD_TTL_MS);
  const expiresAtIso = expiresAt.toISOString();
  const holdToken = randomUUID();

  const existingTokenHash = sessionToken ? hashSessionToken(sessionToken) : null;
  const fallbackToken = createSessionToken();
  const fallbackTokenHash = hashSessionToken(fallbackToken);
  const fallbackSessionExpiresIso = new Date(now.getTime() + SESSION_TTL_MS).toISOString();

  const isRear = isRearCinemaRow(seat.rowName);
  const frontSeatIdsArray = isRear ? Array.from(FRONT_SEAT_IDS) : [];
  const fixedBlockedFrontIdsArray = isRear ? Array.from(FIXED_BLOCKED_FRONT_SEAT_IDS) : [];

  try {
    const [row] = await rawSql<
      {
        reused_session: boolean;
        program_exists: boolean;
        booking_open: boolean | null;
        is_blocked: boolean;
        front_occupied_count: number;
        reservation_id: string | null;
        hold_token: string | null;
        expires_at: string | null;
      }[]
    >`
      WITH valid_session AS (
        SELECT id FROM booking_session
        WHERE ${existingTokenHash}::text IS NOT NULL
          AND token_hash = ${existingTokenHash}
          AND expires_at > ${nowIso}
          AND revoked_at IS NULL
        LIMIT 1
      ),
      new_session AS (
        INSERT INTO booking_session (token_hash, source, expires_at)
        SELECT ${fallbackTokenHash}, 'kiosk', ${fallbackSessionExpiresIso}
        WHERE NOT EXISTS (SELECT 1 FROM valid_session)
        RETURNING id
      ),
      expired AS (
        UPDATE reservation
        SET status = 'expired', hold_token = NULL, expires_at = NULL, updated_at = ${nowIso}
        WHERE program_id = ${programId}
          AND seat_id <> ${seatId}
          AND status = 'held'
          AND expires_at < ${nowIso}
        RETURNING id
      ),
      prog AS (
        SELECT id, booking_open FROM program WHERE id = ${programId} LIMIT 1
      ),
      blk AS (
        SELECT id FROM blocked_seat WHERE program_id = ${programId} AND seat_id = ${seatId} LIMIT 1
      ),
      rear_check AS (
        SELECT
          CASE
            WHEN ${isRear}::boolean THEN (
              SELECT count(DISTINCT occupied_seat_id)::int
              FROM (
                SELECT r.seat_id AS occupied_seat_id
                FROM reservation r
                WHERE r.program_id = ${programId}
                  AND (r.status = 'booked' OR (r.status = 'held' AND r.expires_at >= ${nowIso}))
                  AND r.seat_id = ANY(${frontSeatIdsArray}::text[])
                UNION
                SELECT b.seat_id AS occupied_seat_id
                FROM blocked_seat b
                WHERE b.program_id = ${programId}
                  AND b.seat_id = ANY(${frontSeatIdsArray}::text[])
                UNION
                SELECT unnest(${fixedBlockedFrontIdsArray}::text[]) AS occupied_seat_id
              ) occ
            )
            ELSE ${REAR_ROW_UNLOCK_THRESHOLD}::int
          END AS front_count
      ),
      upserted AS (
        INSERT INTO reservation (program_id, seat_id, status, hold_token, expires_at, booking_id, updated_at)
        SELECT ${programId}, ${seatId}, 'held', ${holdToken}, ${expiresAtIso}, NULL, ${nowIso}
        FROM prog, rear_check
        WHERE prog.booking_open = true
          AND NOT EXISTS (SELECT 1 FROM blk)
          AND rear_check.front_count >= ${REAR_ROW_UNLOCK_THRESHOLD}
        ON CONFLICT (program_id, seat_id) DO UPDATE
        SET status = 'held',
            hold_token = EXCLUDED.hold_token,
            expires_at = EXCLUDED.expires_at,
            booking_id = NULL,
            updated_at = EXCLUDED.updated_at
        WHERE reservation.status <> 'booked'
          AND (reservation.status <> 'held' OR reservation.expires_at <= ${nowIso})
        RETURNING id, hold_token, expires_at
      )
      SELECT
        EXISTS (SELECT 1 FROM valid_session) AS reused_session,
        EXISTS (SELECT 1 FROM prog) AS program_exists,
        (SELECT booking_open FROM prog) AS booking_open,
        EXISTS (SELECT 1 FROM blk) AS is_blocked,
        (SELECT front_count FROM rear_check) AS front_occupied_count,
        (SELECT id FROM upserted) AS reservation_id,
        (SELECT hold_token FROM upserted) AS hold_token,
        (SELECT expires_at FROM upserted) AS expires_at
    `;

    if (!row?.program_exists) {
      throw new BookingError("That program does not exist.", "PROGRAM_NOT_FOUND");
    }
    if (!row.booking_open) {
      throw new BookingError("Booking is not open for this program.", "PROGRAM_CLOSED");
    }
    if (isRear && row.front_occupied_count < REAR_ROW_UNLOCK_THRESHOLD) {
      throw new BookingError(
        `Baris belakang (J–S) belum dibuka. Baris depan baru terisi ${row.front_occupied_count}/${REAR_ROW_UNLOCK_THRESHOLD} kursi.`,
        "SEAT_BLOCKED",
      );
    }
    if (row.is_blocked) {
      throw new BookingError("That seat is unavailable.", "SEAT_BLOCKED");
    }
    if (!row.reservation_id || !row.hold_token || !row.expires_at) {
      throw new BookingError("That seat was just selected by someone else.", "SEAT_UNAVAILABLE");
    }

    notifySeatChange(programId);

    const activeSessionToken = row.reused_session && sessionToken ? sessionToken : fallbackToken;

    return {
      reservationId: row.reservation_id,
      holdToken: row.hold_token,
      seatId: seat.id,
      expiresAt: new Date(row.expires_at).toISOString(),
      sessionToken: activeSessionToken,
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
  const canonicalSeat = CANONICAL_SEATS_BY_ID.get(parsedRequest.seatId);
  if (!canonicalSeat) {
    throw new BookingError("That seat does not exist.", "SEAT_NOT_FOUND");
  }

  const rawSql = getSql();
  const now = new Date();
  const nowIso = now.toISOString();
  const tokenHash = hashSessionToken(parsedRequest.sessionToken);
  const normalizedContact = normalizeContact(parsedRequest.contact);
  const normalizedFullName = normalizeName(parsedRequest.fullName);
  const trimmedContact = parsedRequest.contact.trim();

  try {
    const [row] = await rawSql<
      {
        session_id: string | null;
        program_exists: boolean;
        booking_open: boolean | null;
        res_id: string | null;
        res_status: string | null;
        res_hold_token: string | null;
        res_expires_at: string | Date | null;
        person_booking_id: string | null;
        existing_id: string | null;
        existing_full_name: string | null;
        existing_contact: string | null;
        existing_status: string | null;
        existing_created_at: string | Date | null;
        existing_seat_id: string | null;
        inserted_id: string | null;
        inserted_created_at: string | Date | null;
      }[]
    >`
      WITH sess AS (
        SELECT id FROM booking_session
        WHERE token_hash = ${tokenHash}
          AND expires_at > ${nowIso}
          AND revoked_at IS NULL
        LIMIT 1
      ),
      prog AS (
        SELECT id, booking_open FROM program WHERE id = ${programId} LIMIT 1
      ),
      idem_key AS (
        SELECT COALESCE(
          ${parsedRequest.idempotencyKey ?? null}::text,
          encode(
            sha256(
              (
                ${programId} || ':' ||
                COALESCE((SELECT id::text FROM sess), '') || ':' ||
                ${parsedRequest.seatId} || ':' ||
                ${parsedRequest.holdToken} || ':' ||
                ${normalizedFullName.toLowerCase()} || ':' ||
                ${normalizedContact}
              )::bytea
            ),
            'hex'
          )
        ) AS key
      ),
      existing_idem AS (
        SELECT
          b.id,
          b.full_name,
          b.contact,
          b.status::text AS status,
          b.created_at,
          r.seat_id
        FROM booking b
        LEFT JOIN reservation r ON r.booking_id = b.id AND r.status = 'booked'
        WHERE EXISTS (SELECT 1 FROM sess)
          AND b.program_id = ${programId}
          AND b.idempotency_key = (SELECT key FROM idem_key)
        LIMIT 1
      ),
      res AS (
        SELECT id, status::text AS status, hold_token::text AS hold_token, expires_at
        FROM reservation
        WHERE program_id = ${programId} AND seat_id = ${parsedRequest.seatId}
        FOR UPDATE
      ),
      dup AS (
        SELECT id FROM booking
        WHERE program_id = ${programId}
          AND status = 'booked'
          AND lower(trim(contact)) = ${normalizedContact}
        LIMIT 1
      ),
      expired_target AS (
        UPDATE reservation
        SET status = 'expired', hold_token = NULL, expires_at = NULL, updated_at = ${nowIso}
        WHERE id = (SELECT id FROM res WHERE status = 'held' AND expires_at <= ${nowIso})
          AND NOT EXISTS (SELECT 1 FROM existing_idem)
        RETURNING id
      ),
      can_book AS (
        SELECT
          s.id AS session_id,
          r.id AS res_id,
          ik.key AS idempotency_key
        FROM sess s
        CROSS JOIN prog p
        CROSS JOIN res r
        CROSS JOIN idem_key ik
        WHERE NOT EXISTS (SELECT 1 FROM existing_idem)
          AND p.booking_open = true
          AND r.status = 'held'
          AND r.hold_token = ${parsedRequest.holdToken}
          AND r.expires_at > ${nowIso}
          AND NOT EXISTS (SELECT 1 FROM dup)
      ),
      inserted_booking AS (
        INSERT INTO booking (program_id, full_name, contact, source, idempotency_key, booking_session_id)
        SELECT ${programId}, ${normalizedFullName}, ${trimmedContact}, ${source}::booking_source, c.idempotency_key, c.session_id
        FROM can_book c
        RETURNING id, created_at
      ),
      updated_res AS (
        UPDATE reservation r
        SET status = 'booked',
            booking_id = ib.id,
            hold_token = NULL,
            expires_at = NULL,
            updated_at = ${nowIso}
        FROM inserted_booking ib, can_book c
        WHERE r.id = c.res_id
        RETURNING r.id
      )
      SELECT
        (SELECT id FROM sess) AS session_id,
        EXISTS (SELECT 1 FROM prog) AS program_exists,
        (SELECT booking_open FROM prog) AS booking_open,
        (SELECT id FROM res) AS res_id,
        (SELECT status FROM res) AS res_status,
        (SELECT hold_token FROM res) AS res_hold_token,
        (SELECT expires_at FROM res) AS res_expires_at,
        (SELECT id FROM dup) AS person_booking_id,
        (SELECT id FROM existing_idem) AS existing_id,
        (SELECT full_name FROM existing_idem) AS existing_full_name,
        (SELECT contact FROM existing_idem) AS existing_contact,
        (SELECT status FROM existing_idem) AS existing_status,
        (SELECT created_at FROM existing_idem) AS existing_created_at,
        (SELECT seat_id FROM existing_idem) AS existing_seat_id,
        (SELECT id FROM inserted_booking) AS inserted_id,
        (SELECT created_at FROM inserted_booking) AS inserted_created_at
    `;

    if (!row?.session_id) {
      throw new BookingError("Your booking session has expired.", "SESSION_INVALID");
    }

    if (!row.program_exists) {
      throw new BookingError("That program does not exist.", "PROGRAM_NOT_FOUND");
    }

    if (row.existing_id) {
      const sameRequest =
        row.existing_status === "booked" &&
        row.existing_seat_id === parsedRequest.seatId &&
        normalizeName(row.existing_full_name ?? "").toLowerCase() === normalizedFullName.toLowerCase() &&
        normalizeContact(row.existing_contact ?? "") === normalizedContact;
      if (!sameRequest) {
        throw new BookingError(
          "That idempotency key has already been used for a different booking.",
          "IDEMPOTENCY_CONFLICT",
        );
      }
      const existingSeat = row.existing_seat_id ? CANONICAL_SEATS_BY_ID.get(row.existing_seat_id) : null;
      if (!existingSeat) {
        throw new BookingError("The existing booking has no seat.", "IDEMPOTENCY_CONFLICT");
      }
      return {
        bookingId: row.existing_id,
        programId,
        seatId: existingSeat.id,
        seatLabel: existingSeat.label,
        fullName: row.existing_full_name ?? normalizedFullName,
        contact: row.existing_contact ?? trimmedContact,
        createdAt: new Date(row.existing_created_at ?? now).toISOString(),
      };
    }

    if (!row.booking_open) {
      throw new BookingError("Booking is not open for this program.", "PROGRAM_CLOSED");
    }

    if (!row.res_id || row.res_status !== "held" || row.res_hold_token !== parsedRequest.holdToken) {
      throw new BookingError("Your seat hold is no longer valid.", "HOLD_INVALID");
    }

    const resExpiresAt = row.res_expires_at ? new Date(row.res_expires_at) : null;
    if (!resExpiresAt || resExpiresAt <= now) {
      notifySeatChange(programId);
      throw new BookingError("Your seat hold has expired.", "HOLD_EXPIRED");
    }

    if (row.person_booking_id) {
      throw new BookingError("This contact already has a booking for this program.", "PERSON_ALREADY_BOOKED");
    }

    if (!row.inserted_id) {
      throw new BookingError("Your seat hold is no longer valid.", "HOLD_INVALID");
    }

    notifySeatChange(programId);
    return {
      bookingId: row.inserted_id,
      programId,
      seatId: canonicalSeat.id,
      seatLabel: canonicalSeat.label,
      fullName: normalizedFullName,
      contact: trimmedContact,
      createdAt: new Date(row.inserted_created_at ?? now).toISOString(),
    };
  } catch (error) {
    if (error instanceof BookingError) throw error;
    if (isUniqueViolation(error)) {
      throw new BookingError("That idempotency key has already been used.", "IDEMPOTENCY_CONFLICT");
    }
    throw error;
  }
}

export async function releaseHold(programId: string, seatId: string, holdToken: string, sessionToken: string) {
  const rawSql = getSql();
  const nowIso = new Date().toISOString();
  const tokenHash = hashSessionToken(sessionToken);

  const [row] = await rawSql<
    {
      session_valid: boolean;
      expired_count: number;
      released_count: number;
    }[]
  >`
    WITH valid_session AS (
      SELECT id FROM booking_session
      WHERE token_hash = ${tokenHash}
        AND expires_at > ${nowIso}
        AND revoked_at IS NULL
      LIMIT 1
    ),
    expired AS (
      UPDATE reservation
      SET status = 'expired', hold_token = NULL, expires_at = NULL, updated_at = ${nowIso}
      WHERE EXISTS (SELECT 1 FROM valid_session)
        AND program_id = ${programId}
        AND seat_id <> ${seatId}
        AND status = 'held'
        AND expires_at < ${nowIso}
      RETURNING id
    ),
    released AS (
      UPDATE reservation
      SET status = 'released', hold_token = NULL, expires_at = NULL, updated_at = ${nowIso}
      WHERE EXISTS (SELECT 1 FROM valid_session)
        AND program_id = ${programId}
        AND seat_id = ${seatId}
        AND hold_token = ${holdToken}
        AND status = 'held'
      RETURNING id
    )
    SELECT
      EXISTS (SELECT 1 FROM valid_session) AS session_valid,
      (SELECT count(*)::int FROM expired) AS expired_count,
      (SELECT count(*)::int FROM released) AS released_count
  `;

  if (!row?.session_valid) {
    throw new BookingError("Your booking session has expired.", "SESSION_INVALID");
  }

  if (row.released_count > 0 || row.expired_count > 0) {
    notifySeatChange(programId);
  }
  return { released: row.released_count > 0 };
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

  if (result.cancelled) notifySeatChange(programId);
  return result;
}

type RawProgramRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  day_label: string | null;
  show_date: string | Date | null;
  starts_at: string | null;
  ends_at: string | null;
  booking_open: boolean | null;
  poster_path: string | null;
  reserved_count: number;
  films_json: {
    id: string;
    title: string;
    director: string | null;
    durationMin: number | null;
    origin: string | null;
    synopsis: string | null;
    posterPath: string | null;
    stillPath: string | null;
  }[];
};

function mapRawProgramRowToProgram(p: RawProgramRow): Program {
  const mockProg = MOCK_PROGRAMS.find((m) => m.slug === p.slug);
  const reservedCount = p.reserved_count ?? 0;

  // Calculate available seats according to progressive cinema tiering:
  // Front bookable: 201 seats. If 150 occupied, rear 256 seats unlock (total 457).
  const totalBookable = reservedCount >= REAR_ROW_UNLOCK_THRESHOLD ? 457 : 201;
  const available = Math.max(0, totalBookable - reservedCount);
  const isBookingOpen = Boolean(p.booking_open);
  const isSoldOut = !isBookingOpen || available <= 0;

  const pFilms = p.films_json;
  const mappedFilms: Film[] =
    pFilms && pFilms.length > 0
      ? pFilms.map((f) => ({
          id: f.id,
          title: f.title,
          director: f.director ?? "",
          duration: f.durationMin ? `${f.durationMin} Menit` : "",
          durationMin: f.durationMin ?? undefined,
          origin: f.origin ?? "",
          synopsis: f.synopsis ?? "",
          posterUrl: f.posterPath ?? undefined,
          stillUrl: f.stillPath ?? undefined,
        }))
      : (mockProg?.films ?? []);

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle ?? mockProg?.subtitle,
    description: p.description ?? mockProg?.description,
    dayLabel: p.day_label ?? mockProg?.dayLabel ?? "Sabtu",
    showDate: p.show_date ? String(p.show_date) : mockProg?.showDate,
    startsAt: p.starts_at ? String(p.starts_at) : mockProg?.startsAt,
    endsAt: p.ends_at ? String(p.ends_at) : mockProg?.endsAt,
    timeSlot:
      mockProg?.timeSlot ??
      (p.starts_at && p.ends_at
        ? `${String(p.starts_at).slice(0, 5)} — ${String(p.ends_at).slice(0, 5)}`
        : "10:00 — 12:00"),
    seatsLeft: available,
    isSoldOut,
    bookingOpen: isBookingOpen,
    posterUrl: p.poster_path ?? mockProg?.posterUrl,
    totalFilmsCount: mappedFilms.length,
    films: mappedFilms,
  };
}

/**
 * Retrieves all programs with real-time seat availability calculated directly
 * from PostgreSQL in a single SQL round-trip.
 * Falls back safely to MOCK_PROGRAMS if DB is unreachable.
 */
export async function getProgramsWithLiveAvailability(): Promise<Program[]> {
  try {
    if (!process.env.DATABASE_URL) return MOCK_PROGRAMS;
    const rawSql = getSql();

    const rows = await rawSql<RawProgramRow[]>`
      SELECT
        p.id,
        p.slug,
        p.title,
        p.subtitle,
        p.description,
        p.day_label,
        p.show_date,
        p.starts_at,
        p.ends_at,
        p.booking_open,
        p.poster_path,
        COALESCE(r.active_count, 0)::int AS reserved_count,
        COALESCE(f.films_json, '[]'::json) AS films_json
      FROM program p
      LEFT JOIN (
        SELECT program_id, COUNT(*) AS active_count
        FROM reservation
        WHERE status = 'booked' OR (status = 'held' AND expires_at >= NOW())
        GROUP BY program_id
      ) r ON r.program_id = p.id
      LEFT JOIN (
        SELECT
          program_id,
          json_agg(
            json_build_object(
              'id', id,
              'title', title,
              'director', director,
              'durationMin', duration_min,
              'origin', origin,
              'synopsis', synopsis,
              'posterPath', poster_path,
              'stillPath', still_path
            )
            ORDER BY sort_order ASC
          ) AS films_json
        FROM film
        GROUP BY program_id
      ) f ON f.program_id = p.id
      WHERE p.is_published = true
      ORDER BY p.sort_order ASC
    `;

    if (!rows.length) return MOCK_PROGRAMS;
    return rows.map(mapRawProgramRowToProgram);
  } catch (error) {
    console.error("Failed to query live programs from DB, falling back to mock:", error);
    return MOCK_PROGRAMS;
  }
}

export async function getProgramWithLiveAvailability(slug: string): Promise<Program | undefined> {
  try {
    if (!process.env.DATABASE_URL) {
      return MOCK_PROGRAMS.find((p) => p.slug === slug);
    }
    const rawSql = getSql();

    const [row] = await rawSql<RawProgramRow[]>`
      SELECT
        p.id,
        p.slug,
        p.title,
        p.subtitle,
        p.description,
        p.day_label,
        p.show_date,
        p.starts_at,
        p.ends_at,
        p.booking_open,
        p.poster_path,
        (
          SELECT COUNT(*)::int
          FROM reservation r
          WHERE r.program_id = p.id
            AND (r.status = 'booked' OR (r.status = 'held' AND r.expires_at >= NOW()))
        ) AS reserved_count,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', f.id,
                'title', f.title,
                'director', f.director,
                'durationMin', f.duration_min,
                'origin', f.origin,
                'synopsis', f.synopsis,
                'posterPath', f.poster_path,
                'stillPath', f.still_path
              )
              ORDER BY f.sort_order ASC
            )
            FROM film f
            WHERE f.program_id = p.id
          ),
          '[]'::json
        ) AS films_json
      FROM program p
      WHERE p.slug = ${slug} AND p.is_published = true
      LIMIT 1
    `;

    if (!row) {
      return MOCK_PROGRAMS.find((m) => m.slug === slug);
    }

    return mapRawProgramRowToProgram(row);
  } catch (error) {
    console.error("Failed to query single live program from DB, falling back to mock:", error);
    return MOCK_PROGRAMS.find((p) => p.slug === slug);
  }
}
