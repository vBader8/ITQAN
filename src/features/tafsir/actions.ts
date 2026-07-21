"use server";

import { getTafsir, TafsirApiError, type Tafsir } from "@/features/tafsir/api";

export interface TafsirActionResult {
  tafsir?: Tafsir;
  error?: string;
}

export async function getTafsirAction(
  surahNumber: number,
  ayahNumber: number,
): Promise<TafsirActionResult> {
  try {
    const tafsir = await getTafsir(surahNumber, ayahNumber);
    return { tafsir };
  } catch (error) {
    if (error instanceof TafsirApiError) {
      return { error: error.message };
    }
    throw error;
  }
}
