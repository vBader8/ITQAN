"use server";

import {
  saveContentProgress,
  toggleContentBookmark,
  type ToggleBookmarkResult,
} from "@/lib/content/actions";

export type BookmarkActionResult = ToggleBookmarkResult;

export async function toggleBookmarkAction(
  surahNumber: number,
  ayahNumber: number,
): Promise<BookmarkActionResult> {
  return toggleContentBookmark("quran_ayah", `${surahNumber}:${ayahNumber}`);
}

export async function saveProgressAction(
  surahNumber: number,
  ayahNumber: number,
) {
  await saveContentProgress("quran", String(surahNumber), {
    lastAyahNumber: ayahNumber,
  });
}
