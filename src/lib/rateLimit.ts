/**
 * Lightweight rate-limiter for Next.js API routes.
 *
 * Uses a module-level Map (survives warm serverless instances).
 * Each key gets `limit` requests per `windowMs` milliseconds.
 *
 * For OTP emails a DB-backed check is preferred (see send-code/route.ts).
 * This module covers all other public endpoints.
 */

interface Entry {
  count:   number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Prune stale entries every 5 minutes so the map doesn't grow forever
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  /** Identifier: IP address, email, etc. */
  key:      string;
  /** Max requests allowed in the window */
  limit:    number;
  /** Window size in milliseconds */
  windowMs: number;
}

/**
 * Returns true if the caller should be blocked (over limit).
 * Returns false if the request is allowed.
 */
export function isRateLimited({ key, limit, windowMs }: RateLimitOptions): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= limit) return true;

  entry.count++;
  return false;
}

/**
 * Convenience wrapper: derive key from request IP + route suffix.
 * Falls back to "unknown" when the IP header is missing.
 */
export function getClientIp(req: Request): string {
  const headers = req instanceof Request ? req.headers : (req as { headers: Headers }).headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
