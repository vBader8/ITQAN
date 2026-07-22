import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getCollections,
  getSectionHadiths,
  getSections,
  HadithApiError,
} from "@/features/hadith/api";

function mockFetchImpl(
  handler: (url: string) => { body: unknown; status?: number },
) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL) => {
      const { body, status = 200 } = handler(String(input));
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => body,
      };
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getCollections", () => {
  it("returns only collections with both English and Arabic editions", async () => {
    mockFetchImpl(() => ({
      body: {
        bukhari: {
          name: "Sahih al Bukhari",
          collection: [
            { name: "eng-bukhari", book: "bukhari", language: "English" },
            { name: "ara-bukhari", book: "bukhari", language: "Arabic" },
          ],
        },
        englishOnly: {
          name: "English Only Book",
          collection: [
            {
              name: "eng-englishOnly",
              book: "englishOnly",
              language: "English",
            },
          ],
        },
      },
    }));

    const collections = await getCollections();
    expect(collections).toEqual([
      { slug: "bukhari", name: "Sahih al Bukhari", nameArabic: "صحيح البخاري" },
    ]);
  });

  it("throws HadithApiError on a non-OK response", async () => {
    mockFetchImpl(() => ({ body: {}, status: 500 }));
    await expect(getCollections()).rejects.toBeInstanceOf(HadithApiError);
  });
});

describe("getSections", () => {
  it("returns numbered sections, excluding the empty placeholder section", async () => {
    mockFetchImpl(() => ({
      body: {
        bukhari: {
          metadata: {
            sections: { "0": "", "1": "Revelation", "2": "Belief" },
          },
        },
      },
    }));

    const sections = await getSections("bukhari");
    expect(sections).toEqual([
      { number: 1, name: "Revelation" },
      { number: 2, name: "Belief" },
    ]);
  });

  it("throws HadithApiError for an unknown collection", async () => {
    mockFetchImpl(() => ({ body: {} }));
    await expect(getSections("nonexistent")).rejects.toBeInstanceOf(
      HadithApiError,
    );
  });
});

describe("getSectionHadiths", () => {
  it("zips English and Arabic editions by hadith number", async () => {
    mockFetchImpl((url) => {
      if (url.includes("eng-bukhari")) {
        return {
          body: {
            hadiths: [
              {
                hadithnumber: 1,
                arabicnumber: 1,
                text: "English text",
                grades: [],
              },
            ],
          },
        };
      }
      return {
        body: {
          hadiths: [
            { hadithnumber: 1, arabicnumber: 1, text: "نص عربي", grades: [] },
          ],
        },
      };
    });

    const hadiths = await getSectionHadiths("bukhari", 1);
    expect(hadiths).toEqual([
      {
        hadithNumber: 1,
        arabicNumber: 1,
        textEnglish: "English text",
        textArabic: "نص عربي",
        grades: [],
      },
    ]);
  });

  it("maps grade objects to the domain shape", async () => {
    mockFetchImpl((url) => {
      if (url.includes("eng-tirmidhi")) {
        return {
          body: {
            hadiths: [
              {
                hadithnumber: 1,
                arabicnumber: 1,
                text: "text",
                grades: [{ name: "Al-Albani", grade: "Sahih" }],
              },
            ],
          },
        };
      }
      return { body: { hadiths: [] } };
    });

    const hadiths = await getSectionHadiths("tirmidhi", 1);
    expect(hadiths[0].grades).toEqual([
      { scholar: "Al-Albani", grade: "Sahih" },
    ]);
  });
});
