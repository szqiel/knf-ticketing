import { NextResponse } from "next/server";
import { z } from "zod";
import { holdSeat, releaseHold } from "@/lib/booking/service";
import { BookingError, bookingErrorStatus } from "@/lib/booking/errors";
import { holdRequestSchema } from "@/lib/contracts";

const paramsSchema = z.object({ programId: z.string().uuid() });

function errorResponse(error: unknown) {
  if (error instanceof BookingError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
  }
  console.error("Booking hold request failed", error);
  return NextResponse.json({ error: "Unable to reserve that seat right now.", code: "HOLD_UNAVAILABLE" }, { status: 503 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ programId: string }> },
) {
  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid program id.", code: "INVALID_PROGRAM" }, { status: 400 });
  }

  const parsedBody = holdRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Seat and session details are required.", code: "INVALID_REQUEST" }, { status: 400 });
  }

  try {
    return NextResponse.json(await holdSeat(parsedParams.data.programId, parsedBody.data.seatId, parsedBody.data.sessionToken), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ programId: string }> },
) {
  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid program id.", code: "INVALID_PROGRAM" }, { status: 400 });
  }

  const bodySchema = holdRequestSchema.extend({ holdToken: z.string().uuid() });
  const parsedBody = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Hold and session details are required.", code: "INVALID_REQUEST" }, { status: 400 });
  }

  try {
    return NextResponse.json(await releaseHold(
      parsedParams.data.programId,
      parsedBody.data.seatId,
      parsedBody.data.holdToken,
      parsedBody.data.sessionToken,
    ));
  } catch (error) {
    return errorResponse(error);
  }
}
