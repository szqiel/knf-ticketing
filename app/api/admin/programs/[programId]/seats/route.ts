import { NextResponse } from "next/server";
import { BookingError, bookingErrorStatus } from "@/lib/booking/errors";
import { getAdminSeatMap, setSeatBlocked } from "@/lib/admin/service";
import { requireAdmin } from "@/lib/admin/require-admin";

type Params = { params: Promise<{ programId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  try {
    return NextResponse.json(await getAdminSeatMap((await params).programId), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof BookingError) return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
    return NextResponse.json({ error: "Unable to load admin seat map." }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await request.json().catch(() => null) as { seatId?: unknown; blocked?: unknown; reason?: unknown } | null;
  if (typeof body?.seatId !== "string" || typeof body.blocked !== "boolean") {
    return NextResponse.json({ error: "seatId and blocked are required." }, { status: 400 });
  }
  try {
    return NextResponse.json(await setSeatBlocked((await params).programId, body.seatId, body.blocked, typeof body.reason === "string" ? body.reason : undefined));
  } catch (error) {
    if (error instanceof BookingError) return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
    return NextResponse.json({ error: "Unable to update seat blocker." }, { status: 503 });
  }
}
