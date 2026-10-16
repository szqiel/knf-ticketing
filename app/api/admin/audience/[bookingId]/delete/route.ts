import { NextResponse } from "next/server";
import { BookingError, bookingErrorStatus } from "@/lib/booking/errors";
import { deleteBookingAsAdmin } from "@/lib/admin/service";
import { requireAdmin } from "@/lib/admin/require-admin";

async function handleDelete(request: Request, paramsPromise: Promise<{ bookingId: string }>) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { bookingId } = await paramsPromise;
  const url = new URL(request.url);
  const queryProgramId = url.searchParams.get("programId");
  const body = await request.json().catch(() => null) as { programId?: unknown } | null;
  const programId = typeof body?.programId === "string" ? body.programId : queryProgramId;

  if (!programId) {
    return NextResponse.json({ error: "programId is required to delete booking." }, { status: 400 });
  }

  try {
    const result = await deleteBookingAsAdmin(programId, bookingId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
    }
    return NextResponse.json({ error: "Unable to delete booking." }, { status: 503 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  return handleDelete(request, params);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ bookingId: string }> }) {
  return handleDelete(request, params);
}
