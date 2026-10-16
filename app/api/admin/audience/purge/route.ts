import { NextResponse } from "next/server";
import { BookingError, bookingErrorStatus } from "@/lib/booking/errors";
import { purgeBookingsAsAdmin } from "@/lib/admin/service";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as {
    programId?: unknown;
    confirmationKey?: unknown;
  } | null;

  if (body?.confirmationKey !== "PURGE_DEMO_DATA") {
    return NextResponse.json(
      { error: "Confirmation key 'PURGE_DEMO_DATA' is required to execute purge." },
      { status: 400 },
    );
  }

  const programId = typeof body?.programId === "string" && body.programId.trim() ? body.programId.trim() : undefined;

  try {
    const result = await purgeBookingsAsAdmin(programId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
    }
    return NextResponse.json({ error: "Unable to purge demo bookings." }, { status: 503 });
  }
}
