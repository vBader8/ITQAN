interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/**
 * Best-effort in-memory fixed-window rate limiter, keyed by caller-supplied
 * string (e.g. an IP address). Holds state only for this process — fine for
 * a single instance, not a substitute for a shared store (e.g. Redis) once
 * this app runs on multiple instances.
 */
export function checkRateLimit(
  key: string,
  {
    limit,
    windowMs,
    now = Date.now(),
  }: { limit: number; windowMs: number; now?: number },
): RateLimitResult {
  const entry = buckets.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

/** Test-only: clears all bucket state. */
export function _resetRateLimitsForTests() {
  buckets.clear();
}
