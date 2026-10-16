import { NextResponse } from "next/server";
import { BookingError, bookingErrorStatus } from "@/lib/booking/errors";
import { updateProgram, getAdminPrograms } from "@/lib/admin/service";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function GET(request: Request, { params }: { params: Promise<{ programId: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { programId } = await params;
  const programsList = await getAdminPrograms();
  const program = programsList.find((p) => p.id === programId);

  if (!program) {
    return NextResponse.json({ error: "Program not found." }, { status: 404 });
  }

  return NextResponse.json({ program }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ programId: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { programId } = await params;
  const body = (await request.json().catch(() => null)) as {
    title?: string;
    subtitle?: string;
    description?: string;
    dayLabel?: string;
    startsAt?: string;
    endsAt?: string;
    posterPath?: string;
    bookingOpen?: boolean;
    isPublished?: boolean;
    sortOrder?: number;
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  try {
    const updated = await updateProgram(programId, body);
    return NextResponse.json({ program: updated });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
    }
    return NextResponse.json({ error: "Unable to update program." }, { status: 503 });
  }
}
