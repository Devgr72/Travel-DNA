// [Security] Per-IP in-memory rate limiter (10 req/min).
// Works per-process; for distributed deployments, replace with Redis.

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

/** Returns whether the IP is within its rate limit for this window. */
export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();

  // Purge stale entries to bound memory growth
  for (const [key, val] of store.entries()) {
    if (now > val.resetAt) store.delete(key);
  }

  const entry = store.get(ip);

  if (!entry) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}
