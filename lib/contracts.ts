import { z } from "zod";

export const seatStatusSchema = z.enum(["available", "held", "booked", "blocked"]);
export type SeatStatus = z.infer<typeof seatStatusSchema>;

export const seatSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  block: z.string().min(1),
  rowName: z.string().min(1),
  number: z.number().int().positive(),
  x: z.number(),
  y: z.number(),
  rotation: z.number(),
  status: seatStatusSchema,
  heldUntil: z.string().datetime().nullable(),
});
export type Seat = z.infer<typeof seatSchema>;

export const seatMapResponseSchema = z.object({
  programId: z.string().uuid(),
  seats: z.array(seatSchema),
  generatedAt: z.string().datetime(),
});
export type SeatMapResponse = z.infer<typeof seatMapResponseSchema>;

export const bookingSessionSchema = z.object({
  sessionToken: z.string().min(16),
});
export const BOOKING_SESSION_STORAGE_KEY = "knf26.booking.session";
export const BOOKING_TICKET_STORAGE_PREFIX = "knf26.booking.ticket";

export function bookingTicketStorageKey(bookingId: string) {
  return `${BOOKING_TICKET_STORAGE_PREFIX}:${bookingId}`;
}

export const holdRequestSchema = z.object({
  seatId: z.string().min(1),
  sessionToken: z.string().min(16),
});
export type HoldRequest = z.infer<typeof holdRequestSchema>;

export const holdResponseSchema = z.object({
  reservationId: z.string().uuid(),
  holdToken: z.string().uuid(),
  seatId: z.string().min(1),
  expiresAt: z.string().datetime(),
});
export type HoldResponse = z.infer<typeof holdResponseSchema>;

export const bookingRequestSchema = z.object({
  seatId: z.string().min(1),
  holdToken: z.string().uuid(),
  sessionToken: z.string().min(16),
  fullName: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(3).max(120),
  idempotencyKey: z.string().trim().min(8).max(200).optional(),
});
export type BookingRequest = z.infer<typeof bookingRequestSchema>;

export const cancelBookingRequestSchema = z.object({
  sessionToken: z.string().min(16),
  reason: z.string().trim().max(200).optional(),
});
export type CancelBookingRequest = z.infer<typeof cancelBookingRequestSchema>;

export const bookingResponseSchema = z.object({
  bookingId: z.string().uuid(),
  programId: z.string().uuid(),
  seatId: z.string().min(1),
  seatLabel: z.string().min(1),
  fullName: z.string(),
  contact: z.string(),
  createdAt: z.string().datetime(),
});
export type BookingResponse = z.infer<typeof bookingResponseSchema>;

export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
});
