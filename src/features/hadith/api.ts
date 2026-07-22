import { z } from "zod";
import { logger } from "@/lib/logger";
import type {
  Collection,
  Grade,
  Hadith,
  Section,
} from "@/features/hadith/types";

/**
 * Hadith text is fetched from the fawazahmed0/hadith-api project (same
 * non-ownership rationale as Quran text/tafsir — see features/quran/api.ts).
 * The documented production endpoint is the jsDelivr CDN mirror
 * (`cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1`); this sandbox's network
 * policy blocks that domain, so `HADITH_API_BASE_URL` lets local development
 * point at a mock. The API contract below was verified against the live
 * repository content, not assumed from memory.
 */
const HADITH_API_BASE =
  process.env.HADITH_API_BASE_URL ??
  "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";

// Universally-known bibliographic titles for these classical collections —
// not translations we're asserting, just their standard Arabic names.
const ARABIC_NAMES: Record<string, string> = {
  bukhari: "صحيح البخاري",
  muslim: "صحيح مسلم",
  abudawud: "سنن أبي داود",
  tirmidhi: "جامع الترمذي",
  nasai: "سنن النسائي",
  ibnmajah: "سنن ابن ماجه",
  malik: "موطأ مالك",
  nawawi: "الأربعون النووية",
  qudsi: "الأربعون القدسية",
  dehlawi: "الأربعون لشاه ولي الله الدهلوي",
};

export class HadithApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HadithApiError";
  }
}

async function fetchJson<T>(
  url: string,
  schema: z.ZodType<T>,
  revalidate: number,
): Promise<T> {
  const response = await fetch(url, { next: { revalidate } });

  if (!response.ok) {
    logger.warn("hadith_api.request_failed", { url, status: response.status });
    throw new HadithApiError(
      `Hadith API request failed with ${response.status}`,
    );
  }

  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) {
    logger.warn("hadith_api.unexpected_shape", {
      url,
      issues: parsed.error.issues,
    });
    throw new HadithApiError(
      "Hadith API returned an unexpected response shape",
    );
  }

  return parsed.data;
}

const editionsResponseSchema = z.record(
  z.string(),
  z.object({
    name: z.string(),
    collection: z.array(
      z.object({
        name: z.string(),
        book: z.string(),
        language: z.string(),
      }),
    ),
  }),
);

export async function getCollections(): Promise<Collection[]> {
  const data = await fetchJson(
    `${HADITH_API_BASE}/editions.min.json`,
    editionsResponseSchema,
    60 * 60 * 24 * 7,
  );

  return Object.entries(data)
    .filter(
      ([slug, info]) =>
        info.collection.some((c) => c.name === `eng-${slug}`) &&
        info.collection.some((c) => c.language === "Arabic"),
    )
    .map(([slug, info]) => ({
      slug,
      name: info.name,
      nameArabic: ARABIC_NAMES[slug] ?? info.name,
    }));
}

const infoResponseSchema = z.record(
  z.string(),
  z.object({
    metadata: z.object({
      sections: z.record(z.string(), z.string()),
    }),
  }),
);

export async function getSections(book: string): Promise<Section[]> {
  const data = await fetchJson(
    `${HADITH_API_BASE}/info.min.json`,
    infoResponseSchema,
    60 * 60 * 24 * 7,
  );

  const collection = data[book];
  if (!collection) {
    throw new HadithApiError(`Unknown hadith collection: ${book}`);
  }

  return Object.entries(collection.metadata.sections)
    .filter(([number, name]) => number !== "0" && name.trim() !== "")
    .map(([number, name]) => ({ number: Number(number), name }));
}

const gradeSchema = z.object({ name: z.string(), grade: z.string() });

const sectionHadithsResponseSchema = z.object({
  hadiths: z.array(
    z.object({
      hadithnumber: z.number(),
      arabicnumber: z.number(),
      text: z.string(),
      grades: z.array(gradeSchema),
    }),
  ),
});

export async function getSectionHadiths(
  book: string,
  sectionNumber: number,
): Promise<Hadith[]> {
  const [english, arabic] = await Promise.all([
    fetchJson(
      `${HADITH_API_BASE}/editions/eng-${book}/sections/${sectionNumber}.min.json`,
      sectionHadithsResponseSchema,
      60 * 60 * 24,
    ),
    fetchJson(
      `${HADITH_API_BASE}/editions/ara-${book}/sections/${sectionNumber}.min.json`,
      sectionHadithsResponseSchema,
      60 * 60 * 24,
    ),
  ]);

  const arabicByNumber = new Map(
    arabic.hadiths.map((hadith) => [hadith.hadithnumber, hadith.text]),
  );

  return english.hadiths.map((hadith) => ({
    hadithNumber: hadith.hadithnumber,
    arabicNumber: hadith.arabicnumber,
    textEnglish: hadith.text,
    textArabic: arabicByNumber.get(hadith.hadithnumber) ?? "",
    grades: hadith.grades.map((grade): Grade => ({
      scholar: grade.name,
      grade: grade.grade,
    })),
  }));
}
