import { NextResponse } from "next/server";
import { BookingError, bookingErrorStatus } from "@/lib/booking/errors";
import { updateFilm, deleteFilm } from "@/lib/admin/service";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ filmId: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { filmId } = await params;
  const body = (await request.json().catch(() => null)) as {
    title?: string;
    director?: string;
    durationMin?: number;
    origin?: string;
    synopsis?: string;
    posterPath?: string;
    stillPath?: string;
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    const updated = await updateFilm(filmId, body);
    return NextResponse.json({ film: updated });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
    }
    return NextResponse.json({ error: "Unable to update film." }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ filmId: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { filmId } = await params;
  try {
    const deleted = await deleteFilm(filmId);
    return NextResponse.json({ deleted: true, film: deleted });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
    }
    return NextResponse.json({ error: "Unable to delete film." }, { status: 503 });
  }
}
