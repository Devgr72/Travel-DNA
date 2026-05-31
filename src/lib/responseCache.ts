/**
 * In-process TTL response cache.
 *
 * Works per-serverless-instance; avoids duplicate Gemini calls for identical
 * inputs within the same process lifetime. For distributed deployments, swap
 * the Map for a Redis client without changing the call-sites.
 */

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();
const TTL_MS = 5 * 60 * 1_000; // 5 minutes

/**
 * Returns the cached value for `key`, or `undefined` on miss / expiry.
 * @param key - Opaque cache key (typically JSON-stringified input).
 */
export function cacheGet(key: string): unknown | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.data;
}

/**
 * Stores `data` under `key` for TTL_MS milliseconds.
 * Purges expired entries on every write to bound Map growth.
 * @param key  - Cache key.
 * @param data - Serialisable response payload.
 */
export function cacheSet(key: string, data: unknown): void {
  const now = Date.now();
  for (const [k, v] of store.entries()) {
    if (now > v.expiresAt) store.delete(k);
  }
  store.set(key, { data, expiresAt: now + TTL_MS });
}
