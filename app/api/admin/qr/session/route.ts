import { NextResponse } from "next/server";
import { issueBookingSession } from "@/lib/booking/sessions";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const session = await issueBookingSession("qr");
    const origin =
      request.headers.get("origin") ||
      request.headers.get("x-forwarded-host") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://tomatoes-established-separated-spencer.trycloudflare.com";

    const cleanOrigin = origin.startsWith("http") ? origin : `https://${origin}`;
    const qrUrl = `${cleanOrigin}/?session=${session.token}`;

    return NextResponse.json(
      {
        sessionToken: session.token,
        qrUrl,
        expiresAt: session.expiresAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unable to create QR session:", error);
    return NextResponse.json({ error: "Failed to issue QR session." }, { status: 503 });
  }
}
