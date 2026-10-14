import { NextResponse } from "next/server";
import { issueBookingSession } from "@/lib/booking/sessions";

export async function POST() {
  try {
    const session = await issueBookingSession("kiosk");
    return NextResponse.json(
      {
        sessionToken: session.token,
        expiresAt: session.expiresAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unable to create booking session", error);
    return NextResponse.json(
      { error: "Unable to start a booking session.", code: "SESSION_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
