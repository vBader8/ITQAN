import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";

export { getCurrentUser };

export async function getBookmarkedAyahs(
  surahNumber: number,
): Promise<Set<number>> {
  const user = await getCurrentUser();
  if (!user) return new Set();

  const supabase = await createClient();
  const { data } = await supabase
    .from("quran_bookmarks")
    .select("ayah_number")
    .eq("user_id", user.id)
    .eq("surah_number", surahNumber);

  return new Set((data ?? []).map((row) => row.ayah_number));
}

export interface ContinueReading {
  surahNumber: number;
  lastAyahNumber: number;
}

export async function getContinueReading(): Promise<ContinueReading | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("quran_progress")
    .select("surah_number, last_ayah_number")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    surahNumber: data.surah_number,
    lastAyahNumber: data.last_ayah_number,
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
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("quran_bookmarks")
    .select("surah_number, ayah_number, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    surahNumber: row.surah_number,
    ayahNumber: row.ayah_number,
    createdAt: row.created_at,
  }));
}
