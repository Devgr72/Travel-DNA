// [Security] Applies standard HTTP security headers to every API response.
import { NextResponse } from "next/server";

const HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

/** Attaches security headers to an existing NextResponse and returns it. */
export function withSecurityHeaders(res: NextResponse): NextResponse {
  for (const [k, v] of Object.entries(HEADERS)) {
    res.headers.set(k, v);
  }
  return res;
}

/** Convenience wrapper: create a JSON response with security headers. */
export function secureJson(body: unknown, init?: ResponseInit): NextResponse {
  const res = NextResponse.json(body, init);
  return withSecurityHeaders(res);
}
