import { CANONICAL_SEATS, getCanonicalSeats } from "../lib/booking/canonical-seats";
import {
  isCinemaFrontUnavailable,
  isFrontCinemaRow,
  isRearCinemaRow,
  isRearRowUnlocked,
} from "../lib/booking/seat-layout";

console.log("Total seats in canonical:", CANONICAL_SEATS.length);

const frontBlocked = CANONICAL_SEATS.filter((s) => isCinemaFrontUnavailable(s.rowName, s.number));
console.log("Front-center blocked count (A10-20, B10-21, C10-22, D10-22):", frontBlocked.length);
console.log("Front blocked labels sample:", frontBlocked.slice(0, 5).map((s) => s.label).join(", "), "...", frontBlocked.slice(-5).map((s) => s.label).join(", "));

const defaultSeats = getCanonicalSeats();
const defaultAvailable = defaultSeats.filter((s) => s.status === "available");
const defaultBlocked = defaultSeats.filter((s) => s.status === "blocked");
const defaultRearBlocked = defaultSeats.filter((s) => isRearCinemaRow(s.rowName) && s.status === "blocked");
const defaultRearTotal = defaultSeats.filter((s) => isRearCinemaRow(s.rowName));

console.log("Default: total available:", defaultAvailable.length, "total blocked:", defaultBlocked.length);
console.log("Default: rear seats locked:", defaultRearBlocked.length === defaultRearTotal.length, `(${defaultRearBlocked.length}/${defaultRearTotal.length})`);

const unlockedSeats = getCanonicalSeats({ frontOccupiedCount: 150 });
const unlockedAvailable = unlockedSeats.filter((s) => s.status === "available");
const unlockedRearAvailable = unlockedSeats.filter((s) => isRearCinemaRow(s.rowName) && s.status === "available");
console.log("When front >= 150: total available:", unlockedAvailable.length);
console.log("When front >= 150: rear seats available:", unlockedRearAvailable.length === defaultRearTotal.length, `(${unlockedRearAvailable.length}/${defaultRearTotal.length})`);
