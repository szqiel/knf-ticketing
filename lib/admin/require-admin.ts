import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "./auth";

export async function requireAdmin() {
  if (await isAdminAuthenticated()) return null;
  return NextResponse.json({ error: "Staff authentication required." }, { status: 401 });
}
