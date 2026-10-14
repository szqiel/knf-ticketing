/**
 * Fixed cinema layout rule: the first three front-center rows are unavailable.
 * In seat-label order these span D13-E3, E4-E15, and E16-F8.
 */
export function isCinemaFrontUnavailable(rowName: string, number: number) {
  return (rowName === "D" && number >= 13)
    || rowName === "E"
    || (rowName === "F" && number <= 8);
}
