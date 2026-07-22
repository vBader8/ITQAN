"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";

export interface BookmarkActionResult {
  bookmarked: boolean;
  error?: string;
}

export async function toggleHadithBookmarkAction(
  book: string,
  sectionNumber: number,
  hadithNumber: number,
): Promise<BookmarkActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { bookmarked: false, error: "auth_required" };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("hadith_bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("book", book)
    .eq("hadith_number", hadithNumber)
    .maybeSingle();

  if (existing) {
    await supabase.from("hadith_bookmarks").delete().eq("id", existing.id);
    revalidateTag(`hadith-bookmarks-${user.id}`, "max");
    return { bookmarked: false };
  }

  await supabase.from("hadith_bookmarks").insert({
    user_id: user.id,
    book,
    section_number: sectionNumber,
    hadith_number: hadithNumber,
  });
  revalidateTag(`hadith-bookmarks-${user.id}`, "max");
  return { bookmarked: true };
}

export async function saveHadithProgressAction(
  book: string,
  sectionNumber: number,
  hadithNumber: number,
) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("hadith_progress").upsert(
    {
      user_id: user.id,
      book,
      last_section_number: sectionNumber,
      last_hadith_number: hadithNumber,
    },
    { onConflict: "user_id,book" },
  );
}
