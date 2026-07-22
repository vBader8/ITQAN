import "server-only";
import {
  getBookmarkedContentKeys,
  getLatestContentProgress,
  getRecentContentBookmarks,
} from "@/lib/content/queries";
import { getCurrentUser } from "@/lib/supabase/queries";

export { getCurrentUser };

function parseAyahKey(key: string): {
  surahNumber: number;
  ayahNumber: number;
} {
  const [surah, ayah] = key.split(":");
  return { surahNumber: Number(surah), ayahNumber: Number(ayah) };
}

export async function getBookmarkedAyahs(
  surahNumber: number,
): Promise<Set<number>> {
  const keys = await getBookmarkedContentKeys("quran_ayah", `${surahNumber}:`);
  return new Set(Array.from(keys).map((key) => parseAyahKey(key).ayahNumber));
}

export interface ContinueReading {
  surahNumber: number;
  lastAyahNumber: number;
}

export async function getContinueReading(): Promise<ContinueReading | null> {
  const progress = await getLatestContentProgress("quran");
  if (!progress) return null;

  return {
    surahNumber: Number(progress.contentKey),
    lastAyahNumber: Number(progress.data.lastAyahNumber),
  };
}

export interface BookmarkWithSurah {
  surahNumber: number;
  ayahNumber: number;
  createdAt: string;
}

export async function getRecentBookmarks(
  limit = 5,
): Promise<BookmarkWithSurah[]> {
  const bookmarks = await getRecentContentBookmarks("quran_ayah", limit);
  return bookmarks.map((bookmark) => ({
    ...parseAyahKey(bookmark.contentKey),
    createdAt: bookmark.createdAt,
  }));
}
