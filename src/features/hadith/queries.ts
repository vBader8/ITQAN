import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";

export async function getBookmarkedHadiths(book: string): Promise<Set<number>> {
  const user = await getCurrentUser();
  if (!user) return new Set();

  const supabase = await createClient();
  const { data } = await supabase
    .from("hadith_bookmarks")
    .select("hadith_number")
    .eq("user_id", user.id)
    .eq("book", book);

  return new Set((data ?? []).map((row) => row.hadith_number));
}

export interface HadithContinueReading {
  book: string;
  sectionNumber: number;
  hadithNumber: number;
}

export async function getHadithContinueReading(): Promise<HadithContinueReading | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("hadith_progress")
    .select("book, last_section_number, last_hadith_number")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    book: data.book,
    sectionNumber: data.last_section_number,
    hadithNumber: data.last_hadith_number,
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
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("hadith_bookmarks")
    .select("book, section_number, hadith_number, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    book: row.book,
    sectionNumber: row.section_number,
    hadithNumber: row.hadith_number,
    createdAt: row.created_at,
  }));
}
