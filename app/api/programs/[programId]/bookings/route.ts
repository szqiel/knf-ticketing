import { NextResponse } from "next/server";
import { z } from "zod";
import { confirmBooking } from "@/lib/booking/service";
import { BookingError, bookingErrorStatus } from "@/lib/booking/errors";
import { bookingRequestSchema } from "@/lib/contracts";

const paramsSchema = z.object({ programId: z.string().uuid() });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ programId: string }> },
) {
  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid program id.", code: "INVALID_PROGRAM" }, { status: 400 });
  }

  const rawBody = await request.json().catch(() => null);
  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();
  const parsedBody = bookingRequestSchema.safeParse(
    rawBody && typeof rawBody === "object"
      ? { ...rawBody, ...(idempotencyKey ? { idempotencyKey } : {}) }
      : rawBody,
  );
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Name, contact, seat, hold, and session details are required.", code: "INVALID_REQUEST" }, { status: 400 });
  }

  try {
    return NextResponse.json(await confirmBooking(parsedParams.data.programId, parsedBody.data), { status: 201 });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
    }
    console.error("Booking confirmation failed", error);
    return NextResponse.json({ error: "Unable to confirm your booking right now.", code: "BOOKING_UNAVAILABLE" }, { status: 503 });
  }
}
