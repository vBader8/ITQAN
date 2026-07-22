"use server";

import {
  saveContentProgress,
  toggleContentBookmark,
  type ToggleBookmarkResult,
} from "@/lib/content/actions";

export type BookmarkActionResult = ToggleBookmarkResult;

export async function toggleHadithBookmarkAction(
  book: string,
  sectionNumber: number,
  hadithNumber: number,
): Promise<BookmarkActionResult> {
  return toggleContentBookmark("hadith", `${book}:${hadithNumber}`, {
    sectionNumber,
  });
}

export async function saveHadithProgressAction(
  book: string,
  sectionNumber: number,
  hadithNumber: number,
) {
  await saveContentProgress("hadith", book, {
    lastSectionNumber: sectionNumber,
    lastHadithNumber: hadithNumber,
  });
}
