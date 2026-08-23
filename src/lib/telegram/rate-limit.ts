type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Simple in-memory rate limiter (per server instance).
 * Adequate for Vercel serverless burst protection on auth endpoints.
 */
export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return { ok: true };
}

/** Test helper */
export function resetRateLimits() {
  buckets.clear();
}
