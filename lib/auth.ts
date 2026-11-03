import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Minimal single-user admin auth.
 *
 * - The admin signs in with ADMIN_PASSWORD at /admin/login.
 * - We set an httpOnly cookie holding `<expiresAt>.<hmac>`; the HMAC is keyed
 *   with ADMIN_SESSION_SECRET (or ADMIN_PASSWORD if no secret is set), so
 *   changing the password signs everyone out.
 * - If ADMIN_PASSWORD is not configured, admin access is denied (fail closed).
 */

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function signingKey(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return process.env.ADMIN_SESSION_SECRET || password;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function sign(value: string, key: string): string {
  return createHmac("sha256", key).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(candidate: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  // Compare HMACs so lengths always match and timing doesn't leak.
  const key = "admin-password-check";
  return safeEqual(sign(candidate, key), sign(password, key));
}

export function createSessionToken(now = Date.now()): string {
  const key = signingKey();
  if (!key) throw new Error("ADMIN_PASSWORD is not configured");
  const expiresAt = String(now + SESSION_MAX_AGE_SECONDS * 1000);
  return `${expiresAt}.${sign(expiresAt, key)}`;
}

export function isValidSessionToken(
  token: string | undefined | null,
  now = Date.now(),
): boolean {
  const key = signingKey();
  if (!key || !token) return false;
  const [expiresAt, mac] = token.split(".");
  if (!expiresAt || !mac || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) < now) return false;
  return safeEqual(mac, sign(expiresAt, key));
}

function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/** True when the request carries a valid admin session cookie. */
export function isAdminRequest(request: Request): boolean {
  return isValidSessionToken(
    readCookie(request.headers.get("cookie"), SESSION_COOKIE),
  );
}

/** Standard 401 for API routes. */
export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
