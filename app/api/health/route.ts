import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true, service: "knf-ticketing" }, { headers: { "Cache-Control": "no-store" } });
}
