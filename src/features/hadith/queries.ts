import "server-only";
import {
  getBookmarkedContentKeys,
  getLatestContentProgress,
  getRecentContentBookmarks,
} from "@/lib/content/queries";

function parseHadithKey(key: string): { book: string; hadithNumber: number } {
  const [book, hadithNumber] = key.split(":");
  return { book, hadithNumber: Number(hadithNumber) };
}

export async function getBookmarkedHadiths(book: string): Promise<Set<number>> {
  const keys = await getBookmarkedContentKeys("hadith", `${book}:`);
  return new Set(
    Array.from(keys).map((key) => parseHadithKey(key).hadithNumber),
  );
}

export interface HadithContinueReading {
  book: string;
  sectionNumber: number;
  hadithNumber: number;
}

export async function getHadithContinueReading(): Promise<HadithContinueReading | null> {
  const progress = await getLatestContentProgress("hadith");
  if (!progress) return null;

  return {
    book: progress.contentKey,
    sectionNumber: Number(progress.data.lastSectionNumber),
    hadithNumber: Number(progress.data.lastHadithNumber),
  };
}

export interface HadithBookmarkWithLocation {
  book: string;
  sectionNumber: number;
  hadithNumber: number;
  createdAt: string;
}

export async function getRecentHadithBookmarks(
  limit = 5,
): Promise<HadithBookmarkWithLocation[]> {
  const bookmarks = await getRecentContentBookmarks("hadith", limit);
  return bookmarks.map((bookmark) => ({
    ...parseHadithKey(bookmark.contentKey),
    sectionNumber: Number(bookmark.data.sectionNumber),
    createdAt: bookmark.createdAt,
  }));
}
