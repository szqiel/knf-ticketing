/**
 * Cinema auditorium seating logic and progressive tier unlocking rules.
 */

export const FRONT_ROWS = Object.freeze(["A", "B", "C", "D", "E", "F", "G", "H"] as const);
export const REAR_ROWS = Object.freeze(["J", "K", "L", "M", "N", "P", "Q", "R", "S"] as const);

/**
 * Threshold for unlocking rear seats (Rows J-S).
 * Rows J-S remain blocked/sold until cumulative front seats (A-H) reach 150 occupied seats.
 */
export const REAR_ROW_UNLOCK_THRESHOLD = 150;

/**
 * Fixed cinema rule: Front VIP / reserved center seats are unavailable (blocked/sold):
 * - Row A: 10–20 (11 seats)
 * Total: 11 fixed reserved seats.
 */
export function isCinemaFrontUnavailable(rowName: string, number: number): boolean {
  if (rowName === "A" && number >= 10 && number <= 20) return true;
  return false;
}

export function isFrontCinemaRow(rowName: string): boolean {
  return (FRONT_ROWS as readonly string[]).includes(rowName);
}

export function isRearCinemaRow(rowName: string): boolean {
  return (REAR_ROWS as readonly string[]).includes(rowName);
}

/**
 * Calculates whether rear rows (J-S) should be unlocked based on the
 * number of occupied (booked/held/blocked) seats in the front rows (A-H).
 */
export function isRearRowUnlocked(frontOccupiedCount: number): boolean {
  return frontOccupiedCount >= REAR_ROW_UNLOCK_THRESHOLD;
}
