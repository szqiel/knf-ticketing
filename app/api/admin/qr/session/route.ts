import { NextResponse } from "next/server";
import { issueBookingSession } from "@/lib/booking/sessions";
import { requireAdmin } from "@/lib/admin/require-admin";

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const session = await issueBookingSession("qr");
    const body = (await request.json().catch(() => ({}))) as { origin?: string };

    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    const headerOrigin = request.headers.get("origin");

    let candidateOrigin =
      body?.origin ||
      (forwardedHost ? `${forwardedProto}://${forwardedHost}` : null) ||
      headerOrigin ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://tomatoes-established-separated-spencer.trycloudflare.com";

    // Audience phones cannot connect to localhost or 127.0.0.1!
    // Always fallback to the public Cloudflare tunnel domain.
    if (candidateOrigin.includes("localhost") || candidateOrigin.includes("127.0.0.1")) {
      candidateOrigin =
        process.env.NEXT_PUBLIC_APP_URL ||
        "https://tomatoes-established-separated-spencer.trycloudflare.com";
    }

    const cleanOrigin = candidateOrigin.startsWith("http") ? candidateOrigin : `https://${candidateOrigin}`;
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
