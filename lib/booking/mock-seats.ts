import type { Seat, SeatStatus } from "@/lib/contracts";

type DemoSeatOptions = {
  rowCount?: number;
  soldOut?: boolean;
};

const DEMO_HELD_UNTIL = "2026-10-14T03:00:00.000Z";

/**
 * Temporary visual fixture only. Replace with the venue's canonical seat
 * import before enabling real booking. The row count keeps gallery previews
 * light while the seat page still renders the full 500-seat fixture.
 */
export function createDemoSeats({ rowCount = 25, soldOut = false }: DemoSeatOptions = {}): Seat[] {
  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const rowName = String.fromCharCode(65 + rowIndex);

    return Array.from({ length: 20 }, (_, numberIndex) => {
      const number = numberIndex + 1;
      const block = number <= 6 ? "LEFT" : number >= 15 ? "RIGHT" : "CENTER";
      const status: SeatStatus = soldOut
        ? number % 5 === 0 ? "blocked" : "booked"
        : rowIndex === 0 && number === 2 ? "held"
          : rowIndex === 1 && number === 4 ? "booked"
            : rowIndex === 2 && number === 6 ? "blocked"
              : "available";

      return {
        id: `demo-${rowName}-${number}`,
        label: `${rowName}${number}`,
        block,
        rowName,
        number,
        x: numberIndex * 44,
        y: rowIndex * 44,
        rotation: 0,
        status,
        heldUntil: status === "held" ? DEMO_HELD_UNTIL : null,
      };
    });
  }).flat();
}
