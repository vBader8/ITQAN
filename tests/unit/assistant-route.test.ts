import { afterEach, describe, expect, it, vi } from "vitest";
import { _resetRateLimitsForTests } from "@/lib/rate-limit";

afterEach(() => {
  vi.unstubAllEnvs();
  _resetRateLimitsForTests();
  vi.resetModules();
});

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/assistant", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/assistant", () => {
  it("returns 503 when ANTHROPIC_API_KEY is unset", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const { POST } = await import("@/app/api/assistant/route");

    const response = await POST(jsonRequest({ messages: [] }));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: "assistant_not_configured",
    });
  });

  it("returns 400 for a malformed request body instead of throwing", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const { POST } = await import("@/app/api/assistant/route");

    const response = await POST(jsonRequest({ notMessages: "oops" }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_request" });
  });

  it("returns 400 for a non-JSON body instead of throwing", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    const { POST } = await import("@/app/api/assistant/route");

    const response = await POST(
      new Request("http://localhost/api/assistant", {
        method: "POST",
        body: "not json",
      }),
    );

    expect(response.status).toBe(400);
  });
});
