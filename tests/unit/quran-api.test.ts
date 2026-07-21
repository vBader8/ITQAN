import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getChapters,
  getChapterVerses,
  QuranApiError,
} from "@/features/quran/api";

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

describe("getChapters", () => {
  it("maps the API response to domain Chapter objects", async () => {
    mockFetchOnce({
      chapters: [
        {
          id: 1,
          name_arabic: "الفاتحة",
          name_simple: "Al-Fatihah",
          verses_count: 7,
          revelation_place: "makkah",
          translated_name: { name: "The Opening" },
        },
      ],
    });

    const chapters = await getChapters();
    expect(chapters).toEqual([
      {
        id: 1,
        nameArabic: "الفاتحة",
        nameSimple: "Al-Fatihah",
        translatedName: "The Opening",
        versesCount: 7,
        revelationPlace: "makkah",
      },
    ]);
  });

  it("throws QuranApiError on a non-OK response", async () => {
    mockFetchOnce({}, 403);
    await expect(getChapters()).rejects.toBeInstanceOf(QuranApiError);
  });

  it("throws QuranApiError when the response doesn't match the expected shape", async () => {
    mockFetchOnce({ unexpected: true });
    await expect(getChapters()).rejects.toBeInstanceOf(QuranApiError);
  });
});

describe("getChapterVerses", () => {
  it("strips HTML from translations and picks the configured translation", async () => {
    mockFetchOnce({
      verses: [
        {
          id: 1,
          verse_key: "1:1",
          verse_number: 1,
          text_uthmani: "بِسْمِ اللَّهِ",
          translations: [
            { resource_id: 20, text: "In the name of <i>Allah</i>." },
            { resource_id: 999, text: "Some other translation." },
          ],
        },
      ],
    });

    const verses = await getChapterVerses(1);
    expect(verses).toEqual([
      {
        id: 1,
        verseKey: "1:1",
        verseNumber: 1,
        textUthmani: "بِسْمِ اللَّهِ",
        translation: "In the name of Allah.",
      },
    ]);
  });
});
