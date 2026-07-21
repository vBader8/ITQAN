import { z } from "zod";
import type { Chapter, Verse } from "@/features/quran/types";

/**
 * Quran text and translations are fetched from the Quran.com API (v4) rather
 * than seeded into our own database — this is the Mushaf's Uthmani script,
 * and we should not own transcription risk for it. See
 * https://api-docs.quran.com/docs for the full contract.
 *
 * `ENGLISH_TRANSLATION_RESOURCE_ID` is Saheeh International; swap it in one
 * place if the product wants a different default translation.
 */
const QURAN_API_BASE =
  process.env.QURAN_API_BASE_URL ?? "https://api.quran.com/api/v4";
const ENGLISH_TRANSLATION_RESOURCE_ID = 20;

export class QuranApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuranApiError";
  }
}

const chapterSchema = z.object({
  id: z.number(),
  name_arabic: z.string(),
  name_simple: z.string(),
  verses_count: z.number(),
  revelation_place: z.enum(["makkah", "madinah"]),
  translated_name: z.object({ name: z.string() }),
});

const chaptersResponseSchema = z.object({
  chapters: z.array(chapterSchema),
});

const verseTranslationSchema = z.object({
  resource_id: z.number(),
  text: z.string(),
});

const verseSchema = z.object({
  id: z.number(),
  verse_key: z.string(),
  verse_number: z.number(),
  text_uthmani: z.string(),
  translations: z.array(verseTranslationSchema),
});

const versesResponseSchema = z.object({
  verses: z.array(verseSchema),
});

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}

async function fetchJson<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    throw new QuranApiError(`Quran API request failed with ${response.status}`);
  }

  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) {
    throw new QuranApiError("Quran API returned an unexpected response shape");
  }

  return parsed.data;
}

export async function getChapters(): Promise<Chapter[]> {
  const url = `${QURAN_API_BASE}/chapters?language=en`;
  const data = await fetchJson(url, chaptersResponseSchema);

  return data.chapters.map((chapter) => ({
    id: chapter.id,
    nameArabic: chapter.name_arabic,
    nameSimple: chapter.name_simple,
    translatedName: chapter.translated_name.name,
    versesCount: chapter.verses_count,
    revelationPlace: chapter.revelation_place,
  }));
}

export async function getChapter(surahNumber: number): Promise<Chapter> {
  const chapters = await getChapters();
  const chapter = chapters.find((c) => c.id === surahNumber);
  if (!chapter) {
    throw new QuranApiError(`Surah ${surahNumber} does not exist`);
  }
  return chapter;
}

export async function getChapterVerses(surahNumber: number): Promise<Verse[]> {
  const url =
    `${QURAN_API_BASE}/verses/by_chapter/${surahNumber}` +
    `?language=en&words=false&fields=text_uthmani` +
    `&translations=${ENGLISH_TRANSLATION_RESOURCE_ID}&per_page=300`;

  const data = await fetchJson(url, versesResponseSchema);

  return data.verses.map((verse) => ({
    id: verse.id,
    verseKey: verse.verse_key,
    verseNumber: verse.verse_number,
    textUthmani: verse.text_uthmani,
    translation: stripHtml(
      verse.translations.find(
        (t) => t.resource_id === ENGLISH_TRANSLATION_RESOURCE_ID,
      )?.text ?? "",
    ),
  }));
}
