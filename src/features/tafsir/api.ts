import { z } from "zod";
import { logger } from "@/lib/logger";

/**
 * Tafsir (Quranic exegesis) text, fetched from the Quran.com API at request
 * time for the same reason Quran text/translations are (see
 * features/quran/api.ts): we should not own transcription risk for
 * religious scholarship, and quran.com maintains a vetted source.
 *
 * `DEFAULT_TAFSIR_RESOURCE_ID` is Tafsir Ibn Kathir (abridged, English).
 * Swap it in one place if the product wants a different default, or extend
 * `getTafsir` to accept a resource id once multiple tafsirs are supported.
 */
const QURAN_API_BASE =
  process.env.QURAN_API_BASE_URL ?? "https://api.quran.com/api/v4";
const DEFAULT_TAFSIR_RESOURCE_ID = 169;

export class TafsirApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TafsirApiError";
  }
}

const tafsirResponseSchema = z.object({
  tafsir: z.object({
    text: z.string(),
    resource_name: z.string(),
  }),
});

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, "");
}

export interface Tafsir {
  text: string;
  resourceName: string;
}

export async function getTafsir(
  surahNumber: number,
  ayahNumber: number,
): Promise<Tafsir> {
  const verseKey = `${surahNumber}:${ayahNumber}`;
  const url = `${QURAN_API_BASE}/tafsirs/${DEFAULT_TAFSIR_RESOURCE_ID}/by_ayah/${verseKey}`;

  const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });

  if (!response.ok) {
    logger.warn("tafsir_api.request_failed", { url, status: response.status });
    throw new TafsirApiError(
      `Tafsir API request failed with ${response.status}`,
    );
  }

  const parsed = tafsirResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    logger.warn("tafsir_api.unexpected_shape", {
      url,
      issues: parsed.error.issues,
    });
    throw new TafsirApiError(
      "Tafsir API returned an unexpected response shape",
    );
  }

  return {
    text: stripHtml(parsed.data.tafsir.text),
    resourceName: parsed.data.tafsir.resource_name,
  };
}
