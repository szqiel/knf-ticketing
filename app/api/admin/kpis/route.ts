import { NextResponse } from "next/server";
import { getFestivalKpis } from "@/lib/admin/service";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const kpis = await getFestivalKpis();
    return NextResponse.json(kpis, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to load KPIs:", error);
    return NextResponse.json({ error: "Failed to load festival KPIs." }, { status: 500 });
  }
}
