import { NextResponse } from "next/server";
import { BookingError, bookingErrorStatus } from "@/lib/booking/errors";
import { reorderFilms } from "@/lib/admin/service";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function PUT(request: Request, { params }: { params: Promise<{ programId: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { programId } = await params;
  const body = (await request.json().catch(() => null)) as {
    filmIds?: unknown;
  } | null;

  if (!Array.isArray(body?.filmIds)) {
    return NextResponse.json({ error: "filmIds array is required." }, { status: 400 });
  }

  try {
    const updatedFilms = await reorderFilms(programId, body.filmIds as string[]);
    return NextResponse.json({ films: updatedFilms });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
    }
    return NextResponse.json({ error: "Unable to reorder films." }, { status: 503 });
  }
}
