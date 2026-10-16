import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { MOCK_PROGRAMS } from "../lib/data/mock-programs";
import { isCinemaFrontUnavailable } from "../lib/booking/seat-layout";
import { CANONICAL_SEATS } from "../lib/booking/canonical-seats";
import { blockedSeats, films, programs, seats } from "../lib/db/schema";

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to seed KNF26.");
  }

  const seedBookingOpen = process.env.SEED_BOOKING_OPEN !== "false";
  const queryClient = postgres(databaseUrl, { max: 1 });
  const db = drizzle(queryClient);

  const programRows = MOCK_PROGRAMS.map((program, index) => ({
    slug: program.slug,
    title: program.title,
    subtitle: program.subtitle ?? null,
    description: program.description ?? null,
    showDate: program.showDate ?? (index < 4 ? "2026-10-17" : "2026-10-18"),
    startsAt: program.startsAt ?? `${String(10 + (index % 4) * 2).padStart(2, "0")}:00:00`,
    endsAt: program.endsAt ?? `${String(12 + (index % 4) * 2).padStart(2, "0")}:00:00`,
    dayLabel: program.dayLabel,
    sortOrder: index,
    isPublished: true,
    bookingOpen: seedBookingOpen,
  }));

  const seatRows = CANONICAL_SEATS.map((seat) => ({
    id: seat.id,
    label: seat.label,
    block: seat.block,
    rowName: seat.rowName,
    number: seat.number,
    x: seat.x,
    y: seat.y,
    rotation: seat.rotation,
  }));

  try {
    await db
      .insert(programs)
      .values(programRows)
      .onConflictDoUpdate({
        target: programs.slug,
        set: {
          title: sql`excluded.title`,
          subtitle: sql`excluded.subtitle`,
          description: sql`excluded.description`,
          bookingOpen: sql`excluded.booking_open`,
        },
      });

    const existingPrograms = await db
      .select({ id: programs.id, slug: programs.slug })
      .from(programs);

    const programMap = new Map(existingPrograms.map((p) => [p.slug, p.id]));

    const filmRows = MOCK_PROGRAMS.flatMap((program) => {
      const pId = programMap.get(program.slug);
      if (!pId || !program.films) return [];

      return program.films.map((film, filmIndex) => ({
        programId: pId,
        title: film.title,
        director: film.director,
        durationMin: film.durationMin ?? 15,
        origin: film.origin,
        synopsis: film.synopsis,
        sortOrder: filmIndex,
      }));
    });

    if (filmRows.length > 0) {
      await db.insert(films).values(filmRows).onConflictDoNothing();
    }
    await db.insert(seats).values(seatRows).onConflictDoNothing();

    const blockedSeatRows = existingPrograms.flatMap((program) =>
      seatRows
        .filter((seat) => isCinemaFrontUnavailable(seat.rowName, seat.number))
        .map((seat) => ({
          programId: program.id,
          seatId: seat.id,
          reason: "Front-center reserved (A10-20, B10-21, C10-22, D10-22)",
        })),
    );

    if (blockedSeatRows.length > 0) {
      await db.insert(blockedSeats).values(blockedSeatRows).onConflictDoNothing();
    }

    console.log(
      `Seeded ${existingPrograms.length} programs, ${filmRows.length} films, ${seatRows.length} seats, and ${blockedSeatRows.length} blocked-seat mappings.`,
    );
  } finally {
    await queryClient.end();
  }
}

void seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
