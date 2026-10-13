import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { films, programs, seats } from "../lib/db/schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed KNF26.");
}

const sql = postgres(databaseUrl, { max: 1 });
const db = drizzle(sql);

const programRows = Array.from({ length: 8 }, (_, index) => ({
  slug: `knf26-program-${index + 1}`,
  title: `KNF26 Program ${index + 1}`,
  subtitle: "Program title to be edited in Content Admin",
  description: "Seed record for the KNF26 ticketing system.",
  showDate: index < 4 ? "2026-11-07" : "2026-11-08",
  startsAt: `${String(10 + (index % 4) * 2).padStart(2, "0")}:00:00`,
  endsAt: `${String(12 + (index % 4) * 2).padStart(2, "0")}:00:00`,
  dayLabel: index < 4 ? "DAY 1" : "DAY 2",
  sortOrder: index,
  isPublished: false,
  bookingOpen: false,
}));

const seatRows = Array.from({ length: 25 }, (_, rowIndex) => {
  const rowName = String.fromCharCode(65 + rowIndex);
  return Array.from({ length: 20 }, (_, numberIndex) => {
    const number = numberIndex + 1;
    return {
      id: `${rowName}-${String(number).padStart(2, "0")}`,
      label: `${rowName}${number}`,
      block: number <= 6 ? "LEFT" : number >= 15 ? "RIGHT" : "CENTER",
      rowName,
      number,
      x: numberIndex * 44,
      y: rowIndex * 44,
      rotation: 0,
    };
  });
}).flat();

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

  console.log(`Seeded ${insertedPrograms.length} programs, ${filmRows.length} films, and ${seatRows.length} seats.`);
} finally {
  await sql.end();
}
