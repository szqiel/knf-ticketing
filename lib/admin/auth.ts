import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "knf26_admin_session";
const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() || null;
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() || getAdminPassword();
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword() && getAdminSessionSecret());
}

export function verifyAdminPassword(password: string) {
  const configuredPassword = getAdminPassword();
  return Boolean(configuredPassword && safeEqual(password, configuredPassword));
}

export function createAdminSessionToken() {
  const secret = getAdminSessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET or ADMIN_PASSWORD is required.");

  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const payload = `admin.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function isValidAdminSessionToken(token: string | undefined) {
  const secret = getAdminSessionSecret();
  if (!secret || !token) return false;

  const [scope, expiresAtValue, signature] = token.split(".");
  const expiresAt = Number(expiresAtValue);
  if (scope !== "admin" || !Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000) || !signature) {
    return false;
  }

  const payload = `${scope}.${expiresAtValue}`;
  return safeEqual(signature, sign(payload, secret));
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return isValidAdminSessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  };
}
