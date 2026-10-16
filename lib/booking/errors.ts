export class BookingError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "SESSION_INVALID"
      | "PROGRAM_NOT_FOUND"
      | "PROGRAM_CLOSED"
      | "SEAT_NOT_FOUND"
      | "SEAT_BLOCKED"
      | "SEAT_UNAVAILABLE"
      | "HOLD_EXPIRED"
      | "HOLD_INVALID"
      | "PERSON_ALREADY_BOOKED"
      | "IDEMPOTENCY_CONFLICT"
      | "BOOKING_NOT_FOUND"
      | "BOOKING_CANCELLED"
      | "FILM_NOT_FOUND",
  ) {
    super(message);
    this.name = "BookingError";
  }
}

export function bookingErrorStatus(code: BookingError["code"]) {
  if (code === "SESSION_INVALID") return 401;
  if (code === "PROGRAM_NOT_FOUND" || code === "SEAT_NOT_FOUND" || code === "BOOKING_NOT_FOUND" || code === "FILM_NOT_FOUND") return 404;
  if (
    code === "SEAT_UNAVAILABLE" ||
    code === "SEAT_BLOCKED" ||
    code === "PERSON_ALREADY_BOOKED" ||
    code === "IDEMPOTENCY_CONFLICT" ||
    code === "BOOKING_CANCELLED"
  ) return 409;
  return 400;
}

export function isBookingError(error: unknown): error is BookingError {
  return error instanceof BookingError;
}
