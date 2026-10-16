import { NextResponse } from "next/server";
import { listAudience } from "@/lib/admin/service";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function GET(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
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
}
