import { afterEach, describe, expect, it, vi } from "vitest";
import { getTafsir, TafsirApiError } from "@/features/tafsir/api";

function mockFetchOnce(body: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getTafsir", () => {
  it("strips HTML and maps the API response to a domain Tafsir object", async () => {
    mockFetchOnce({
      tafsir: {
        text: "<p>This is the <b>tafsir</b> text.</p>",
        resource_name: "Tafsir Ibn Kathir",
      },
    });

    const tafsir = await getTafsir(1, 1);
    expect(tafsir).toEqual({
      text: "This is the tafsir text.",
      resourceName: "Tafsir Ibn Kathir",
    });
  });

  it("throws TafsirApiError on a non-OK response", async () => {
    mockFetchOnce({}, 404);
    await expect(getTafsir(1, 1)).rejects.toBeInstanceOf(TafsirApiError);
  });

  it("throws TafsirApiError when the response doesn't match the expected shape", async () => {
    mockFetchOnce({ unexpected: true });
    await expect(getTafsir(1, 1)).rejects.toBeInstanceOf(TafsirApiError);
  });
});
