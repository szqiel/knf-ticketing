import { NextResponse } from "next/server";
import { listAudience } from "@/lib/admin/service";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const url = new URL(request.url);
    const rows = await listAudience({
      programId: url.searchParams.get("programId") ?? undefined,
      from: url.searchParams.get("from") ?? undefined,
      to: url.searchParams.get("to") ?? undefined,
    });
    return NextResponse.json(
      {
        audience: rows,
        rows: rows,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[api/admin/audience] Failed to fetch audience:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load audience data" },
      { status: 500 },
    );
  }
}
