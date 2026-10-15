import type { Seat } from "@/lib/contracts";
import { getCanonicalSeats } from "./canonical-seats";

type DemoSeatOptions = {
  rowCount?: number;
  soldOut?: boolean;
  frontOccupiedCount?: number;
};

/**
 * Returns canonical cinema seats for visual previews and demo environments.
 */
export function createDemoSeats({ soldOut = false, frontOccupiedCount }: DemoSeatOptions = {}): Seat[] {
  return getCanonicalSeats({ soldOut, frontOccupiedCount });
}
