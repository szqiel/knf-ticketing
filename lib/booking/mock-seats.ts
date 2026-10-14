import type { Seat, SeatStatus } from "@/lib/contracts";

type DemoSeatOptions = {
  rowCount?: number;
  soldOut?: boolean;
};

// The cinema layout consumes the fixture sequentially by section. The first
// three rows of the front-center group map to D13-E3, E4-E15, and E16-F8.
function isCinemaFrontUnavailable(rowName: string, number: number) {
  return (rowName === "D" && number >= 13)
    || rowName === "E"
    || (rowName === "F" && number <= 8);
}

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
        : isCinemaFrontUnavailable(rowName, number) ? "blocked" : "available";

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
        heldUntil: null,
      };
    });
  }).flat();
}
