import { NextResponse } from "next/server";
import { getAdminPrograms } from "@/lib/admin/service";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  return NextResponse.json({ programs: await getAdminPrograms() }, { headers: { "Cache-Control": "no-store" } });
}
