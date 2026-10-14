import { NextResponse } from "next/server";
import { z } from "zod";
import { BookingError, bookingErrorStatus } from "@/lib/booking/errors";
import { getSeatMapBySlug } from "@/lib/booking/service";

const paramsSchema = z.object({ slug: z.string().trim().min(1).max(160) });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const parsedParams = paramsSchema.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid program slug.", code: "INVALID_PROGRAM" }, { status: 400 });
  }

  try {
    return NextResponse.json(await getSeatMapBySlug(parsedParams.data.slug), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
    }
    console.error("Unable to load seat map by slug", error);
    return NextResponse.json({ error: "Seat map is temporarily unavailable.", code: "SEAT_MAP_UNAVAILABLE" }, { status: 503 });
  }
}
