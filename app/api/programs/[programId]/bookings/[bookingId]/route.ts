import { NextResponse } from "next/server";
import { z } from "zod";
import { cancelBooking } from "@/lib/booking/service";
import { BookingError, bookingErrorStatus } from "@/lib/booking/errors";
import { cancelBookingRequestSchema } from "@/lib/contracts";

const paramsSchema = z.object({
  programId: z.string().uuid(),
  bookingId: z.string().uuid(),
});

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ programId: string; bookingId: string }> },
) {
  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid program or booking id.", code: "INVALID_REQUEST" }, { status: 400 });
  }

  const parsedBody = cancelBookingRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Session details are required.", code: "INVALID_REQUEST" }, { status: 400 });
  }

  try {
    return NextResponse.json(
      await cancelBooking(
        parsedParams.data.programId,
        parsedParams.data.bookingId,
        parsedBody.data.sessionToken,
        parsedBody.data.reason,
      ),
    );
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
    }
    console.error("Booking cancellation failed", error);
    return NextResponse.json({ error: "Unable to cancel that booking right now.", code: "BOOKING_UNAVAILABLE" }, { status: 503 });
  }
}
