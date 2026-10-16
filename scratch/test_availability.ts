import { getSeatMap } from "../lib/booking/service";
import { getDb } from "../lib/db/client";
import { programs } from "../lib/db/schema";

async function test() {
  const db = getDb();
  const allProgs = await db.select().from(programs);
  console.log("Programs count:", allProgs.length);
  for (const p of allProgs) {
    const seatMap = await getSeatMap(p.id);
    const available = seatMap.seats.filter((s) => s.status === "available").length;
    console.log(`${p.slug} -> available seats: ${available}`);
  }
  process.exit(0);
}

test().catch((e) => {
  console.error(e);
  process.exit(1);
});
