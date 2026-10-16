import { NextResponse } from "next/server";
import { getAdminPrograms } from "@/lib/admin/service";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const programs = await getAdminPrograms();
    return NextResponse.json({ programs }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/programs] Failed to fetch programs:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load admin programs" },
      { status: 500 },
    );
  }
}
