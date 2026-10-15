import type { Seat, SeatStatus } from "@/lib/contracts";
import canonicalSeatsRaw from "./canonical-seats.json";
import {
  isCinemaFrontUnavailable,
  isFrontCinemaRow,
  isRearCinemaRow,
  isRearRowUnlocked,
  REAR_ROW_UNLOCK_THRESHOLD,
} from "./seat-layout";

export const CANONICAL_SEATS: readonly Seat[] = Object.freeze(canonicalSeatsRaw as Seat[]);

export const CANONICAL_SEAT_COUNT = CANONICAL_SEATS.length;

export type CreateCanonicalSeatsOptions = {
  soldOut?: boolean;
  frontOccupiedCount?: number;
  blockedPredicate?: (rowName: string, number: number) => boolean;
};

/**
 * Returns the canonical 506-seat cinema fixture extracted directly from Figma (node 179:18142).
 * Seat numbering runs from right-to-left facing the screen (Seat 1 is front-right, max seat is front-left).
 *
 * Business Rules:
 * 1. Front VIP/center seats (A10-20, B10-21, C10-22, D10-22) are always blocked/sold.
 * 2. Rear rows (J-S) remain blocked/sold until cumulative front seats (A-H) reach 150 occupied seats.
 */
export function getCanonicalSeats({
  soldOut = false,
  frontOccupiedCount,
  blockedPredicate = isCinemaFrontUnavailable,
}: CreateCanonicalSeatsOptions = {}): Seat[] {
  // Step 1: Base status (all front VIP seats marked blocked/sold)
  const initialSeats: Seat[] = CANONICAL_SEATS.map((seat) => {
    let status: SeatStatus = "available";

    if (soldOut) {
      status = seat.number % 5 === 0 ? "blocked" : "booked";
    } else if (blockedPredicate(seat.rowName, seat.number)) {
      status = "blocked";
    }

    return {
      ...seat,
      status,
    };
  });

  if (soldOut) {
    return initialSeats;
  }

  // Step 2: Determine cumulative front seats occupied (A-H)
  const actualFrontOccupied = initialSeats.filter(
    (s) => isFrontCinemaRow(s.rowName) && s.status !== "available",
  ).length;

  const effectiveFrontCount = frontOccupiedCount !== undefined
    ? frontOccupiedCount
    : actualFrontOccupied;

  const rearUnlocked = isRearRowUnlocked(effectiveFrontCount);

  // Step 3: If front seats have not reached the 150 threshold, lock rear rows J-S as blocked/sold
  if (!rearUnlocked) {
    return initialSeats.map((seat) => {
      if (isRearCinemaRow(seat.rowName)) {
        return {
          ...seat,
          status: "blocked" as SeatStatus,
        };
      }
      return seat;
    });
  }

  return initialSeats;
}
