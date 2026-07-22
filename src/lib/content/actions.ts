"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";
import type { Json } from "@/lib/supabase/types";
import type {
  BookmarkContentType,
  ProgressContentType,
} from "@/lib/content/types";

export interface ToggleBookmarkResult {
  bookmarked: boolean;
  error?: string;
}

export async function toggleContentBookmark(
  contentType: BookmarkContentType,
  contentKey: string,
  data: Record<string, unknown> = {},
): Promise<ToggleBookmarkResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { bookmarked: false, error: "auth_required" };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("content_bookmarks")
    .select("id")
    .eq("user_id", user.id)
    .eq("content_type", contentType)
    .eq("content_key", contentKey)
    .maybeSingle();

  if (existing) {
    await supabase.from("content_bookmarks").delete().eq("id", existing.id);
    return { bookmarked: false };
  }

  await supabase.from("content_bookmarks").insert({
    user_id: user.id,
    content_type: contentType,
    content_key: contentKey,
    data: data as Json,
  });
  return { bookmarked: true };
}

export async function saveContentProgress(
  contentType: ProgressContentType,
  contentKey: string,
  data: Record<string, unknown>,
) {
  const user = await getCurrentUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("content_progress").upsert(
    {
      user_id: user.id,
      content_type: contentType,
      content_key: contentKey,
      data: data as Json,
    },
    { onConflict: "user_id,content_type,content_key" },
  );
}
