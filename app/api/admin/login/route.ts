import { NextResponse } from "next/server";
import { adminCookieOptions, createAdminSessionToken, isAdminConfigured, verifyAdminPassword, ADMIN_COOKIE_NAME } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin credentials are not configured." }, { status: 503 });
  }
  if (typeof body?.password !== "string" || !verifyAdminPassword(body.password)) {
    return NextResponse.json({ error: "Invalid staff password." }, { status: 401 });
  }

  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), adminCookieOptions());
  return response;
}
