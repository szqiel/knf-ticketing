import type { Seat } from "@/lib/contracts";

/**
 * Temporary visual fixture only. Replace with the venue's canonical seat
 * import before enabling real booking.
 */
export function createDemoSeats(): Seat[] {
  return Array.from({ length: 25 }, (_, rowIndex) => {
    const rowName = String.fromCharCode(65 + rowIndex);

    return Array.from({ length: 20 }, (_, numberIndex) => {
      const number = numberIndex + 1;
      const block = number <= 6 ? "LEFT" : number >= 15 ? "RIGHT" : "CENTER";

      return {
        id: `demo-${rowName}-${number}`,
        label: `${rowName}${number}`,
        block,
        rowName,
        number,
        x: numberIndex * 44,
        y: rowIndex * 44,
        rotation: 0,
        status: "available" as const,
        heldUntil: null,
      };
    });
  }).flat();
}
