import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { MOCK_PROGRAMS } from "../lib/data/mock-programs";
import { isCinemaFrontUnavailable } from "../lib/booking/seat-layout";
import { CANONICAL_SEATS } from "../lib/booking/canonical-seats";
import { blockedSeats, films, programs, seats } from "../lib/db/schema";

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to seed KNF26.");
  }

  const seedBookingOpen = process.env.SEED_BOOKING_OPEN === "true";
  const sql = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sql);

  const programRows = MOCK_PROGRAMS.map((program, index) => ({
    slug: program.slug,
    title: program.title,
    subtitle: program.subtitle ?? null,
    description: program.description ?? null,
    showDate: index < 4 ? "2026-11-07" : "2026-11-08",
    startsAt: `${String(10 + (index % 4) * 2).padStart(2, "0")}:00:00`,
    endsAt: `${String(12 + (index % 4) * 2).padStart(2, "0")}:00:00`,
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
    const insertedPrograms = await db
      .insert(programs)
      .values(programRows)
      .onConflictDoNothing({ target: programs.slug })
      .returning({ id: programs.id });

    const filmRows = insertedPrograms.flatMap((program, programIndex) =>
      Array.from({ length: 10 }, (_, filmIndex) => ({
        programId: program.id,
        title: `Seed Film ${programIndex + 1}.${filmIndex + 1}`,
        director: "TBD",
        durationMin: 10,
        origin: "Indonesia",
        synopsis: "Replace this seed synopsis with the final film synopsis.",
        sortOrder: filmIndex,
      })),
    );

    if (filmRows.length > 0) {
      await db.insert(films).values(filmRows).onConflictDoNothing();
    }
    await db.insert(seats).values(seatRows).onConflictDoNothing();

    const seededPrograms = await db.select({ id: programs.id }).from(programs);
    const blockedSeatRows = seededPrograms.flatMap((program) =>
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
      `Seeded ${insertedPrograms.length} programs, ${filmRows.length} films, ${seatRows.length} seats, and ${blockedSeatRows.length} blocked-seat mappings.`,
    );
  } finally {
    await sql.end();
  }
}

void seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
