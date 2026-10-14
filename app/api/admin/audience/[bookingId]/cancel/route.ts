import { NextResponse } from "next/server";
import { BookingError, bookingErrorStatus } from "@/lib/booking/errors";
import { cancelBookingAsAdmin } from "@/lib/admin/service";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function POST(request: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await request.json().catch(() => null) as { programId?: unknown; reason?: unknown } | null;
  if (typeof body?.programId !== "string") return NextResponse.json({ error: "programId is required." }, { status: 400 });
  try {
    return NextResponse.json(await cancelBookingAsAdmin((body.programId), (await params).bookingId, typeof body.reason === "string" ? body.reason : undefined));
  } catch (error) {
    if (error instanceof BookingError) return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
    return NextResponse.json({ error: "Unable to cancel booking." }, { status: 503 });
  }
}
