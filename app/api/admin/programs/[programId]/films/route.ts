import { NextResponse } from "next/server";
import { BookingError, bookingErrorStatus } from "@/lib/booking/errors";
import { listFilmsForProgram, createFilm } from "@/lib/admin/service";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function GET(request: Request, { params }: { params: Promise<{ programId: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { programId } = await params;
  try {
    const films = await listFilmsForProgram(programId);
    return NextResponse.json({ films }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
    }
    return NextResponse.json({ error: "Unable to load films." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ programId: string }> }) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const { programId } = await params;
  const body = (await request.json().catch(() => null)) as {
    title?: unknown;
    director?: unknown;
    durationMin?: unknown;
    origin?: unknown;
    synopsis?: unknown;
    posterPath?: unknown;
    stillPath?: unknown;
  } | null;

  if (typeof body?.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "Film title is required." }, { status: 400 });
  }

  try {
    const film = await createFilm(programId, {
      title: body.title,
      director: typeof body.director === "string" ? body.director : undefined,
      durationMin: typeof body.durationMin === "number" ? body.durationMin : Number(body.durationMin) || undefined,
      origin: typeof body.origin === "string" ? body.origin : undefined,
      synopsis: typeof body.synopsis === "string" ? body.synopsis : undefined,
      posterPath: typeof body.posterPath === "string" ? body.posterPath : undefined,
      stillPath: typeof body.stillPath === "string" ? body.stillPath : undefined,
    });
    return NextResponse.json({ film }, { status: 201 });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: bookingErrorStatus(error.code) });
    }
    return NextResponse.json({ error: "Unable to create film." }, { status: 503 });
  }
}
