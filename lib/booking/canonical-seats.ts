import type { Seat, SeatStatus } from "@/lib/contracts";
import canonicalSeatsRaw from "./canonical-seats.json";
import { isCinemaFrontUnavailable } from "./seat-layout";

export const CANONICAL_SEATS: readonly Seat[] = Object.freeze(canonicalSeatsRaw as Seat[]);

export const CANONICAL_SEAT_COUNT = CANONICAL_SEATS.length;

export type CreateCanonicalSeatsOptions = {
  soldOut?: boolean;
  blockedPredicate?: (rowName: string, number: number) => boolean;
};

/**
 * Returns the canonical 506-seat cinema fixture extracted directly from Figma (node 179:18142).
 * Seat numbering runs from right-to-left facing the screen (Seat 1 is front-right, max seat is front-left).
 */
export function getCanonicalSeats({
  soldOut = false,
  blockedPredicate = isCinemaFrontUnavailable,
}: CreateCanonicalSeatsOptions = {}): Seat[] {
  return CANONICAL_SEATS.map((seat) => {
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
}
