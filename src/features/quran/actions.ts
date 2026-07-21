"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface BookmarkActionResult {
  bookmarked: boolean;
  error?: string;
}

export async function toggleBookmarkAction(
  surahNumber: number,
  ayahNumber: number,
): Promise<BookmarkActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { bookmarked: false, error: "auth_required" };
  }

  const { data: existing } = await supabase
    .from("quran_bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("surah_number", surahNumber)
    .eq("ayah_number", ayahNumber)
    .maybeSingle();

  if (existing) {
    await supabase.from("quran_bookmarks").delete().eq("id", existing.id);
    revalidateTag(`bookmarks-${user.id}`, "max");
    return { bookmarked: false };
  }

  await supabase.from("quran_bookmarks").insert({
    user_id: user.id,
    surah_number: surahNumber,
    ayah_number: ayahNumber,
  });
  revalidateTag(`bookmarks-${user.id}`, "max");
  return { bookmarked: true };
}

export async function saveProgressAction(
  surahNumber: number,
  ayahNumber: number,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("quran_progress").upsert(
    {
      user_id: user.id,
      surah_number: surahNumber,
      last_ayah_number: ayahNumber,
    },
    { onConflict: "user_id,surah_number" },
  );
}
