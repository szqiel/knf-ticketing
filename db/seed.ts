import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { MOCK_PROGRAMS } from "../lib/data/mock-programs";
import { isCinemaFrontUnavailable } from "../lib/booking/seat-layout";
import { CANONICAL_SEATS } from "../lib/booking/canonical-seats";
import { blockedSeats, films, programs, seats } from "../lib/db/schema";

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

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to seed KNF26.");
  }

  const cleanUrl = normalizeDatabaseUrl(databaseUrl);
  const isSupabasePooler = cleanUrl.includes("pooler.supabase.com") || cleanUrl.includes(":6543");
  const seedBookingOpen = process.env.SEED_BOOKING_OPEN !== "false";
  const queryClient = postgres(cleanUrl, {
    max: 1,
    prepare: !isSupabasePooler,
    ssl: isSupabasePooler ? "require" : undefined,
  });
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
