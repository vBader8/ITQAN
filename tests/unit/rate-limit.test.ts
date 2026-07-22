import { beforeEach, describe, expect, it } from "vitest";
import { _resetRateLimitsForTests, checkRateLimit } from "@/lib/rate-limit";

beforeEach(() => {
  _resetRateLimitsForTests();
});

describe("checkRateLimit", () => {
  it("allows requests up to the limit within the window", () => {
    const now = 1_000_000;
    for (let i = 0; i < 3; i++) {
      const result = checkRateLimit("user-a", {
        limit: 3,
        windowMs: 60_000,
        now,
      });
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks the request once the limit is reached within the window", () => {
    const now = 1_000_000;
    checkRateLimit("user-b", { limit: 2, windowMs: 60_000, now });
    checkRateLimit("user-b", { limit: 2, windowMs: 60_000, now });
    const result = checkRateLimit("user-b", {
      limit: 2,
      windowMs: 60_000,
      now,
    });
    expect(result).toEqual({ allowed: false, remaining: 0 });
  });

  it("resets the count once the window has elapsed", () => {
    const start = 1_000_000;
    checkRateLimit("user-c", { limit: 1, windowMs: 60_000, now: start });
    const blocked = checkRateLimit("user-c", {
      limit: 1,
      windowMs: 60_000,
      now: start + 1_000,
    });
    expect(blocked.allowed).toBe(false);

    const afterWindow = checkRateLimit("user-c", {
      limit: 1,
      windowMs: 60_000,
      now: start + 61_000,
    });
    expect(afterWindow.allowed).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const now = 1_000_000;
    checkRateLimit("user-d", { limit: 1, windowMs: 60_000, now });
    const other = checkRateLimit("user-e", { limit: 1, windowMs: 60_000, now });
    expect(other.allowed).toBe(true);
  });
});
