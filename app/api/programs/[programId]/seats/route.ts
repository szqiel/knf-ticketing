import { NextResponse } from "next/server";
import { z } from "zod";
import { getSeatMap } from "@/lib/booking/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    console.error("Unable to load seat map", error);
    return NextResponse.json({ error: "Seat map is temporarily unavailable." }, { status: 503 });
  }
}
