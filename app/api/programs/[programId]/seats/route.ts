import { NextResponse } from "next/server";
import { z } from "zod";
import { getSeatMap } from "@/lib/booking/service";
import { BookingError, bookingErrorStatus } from "@/lib/booking/errors";

const paramsSchema = z.object({ programId: z.string().uuid() });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ programId: string }> },
) {
  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid program id.", code: "INVALID_PROGRAM" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getSeatMap(parsedParams.data.programId));
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
    }
    console.error("Unable to load seat map", error);
    return NextResponse.json({ error: "Seat map is temporarily unavailable.", code: "SEAT_MAP_UNAVAILABLE" }, { status: 503 });
  }
}
