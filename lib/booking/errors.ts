export class BookingError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "SESSION_INVALID"
      | "PROGRAM_CLOSED"
      | "SEAT_NOT_FOUND"
      | "SEAT_BLOCKED"
      | "SEAT_UNAVAILABLE"
      | "HOLD_EXPIRED"
      | "HOLD_INVALID",
  ) {
    super(message);
    this.name = "BookingError";
  }
}
