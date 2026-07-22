import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";
import type {
  BookmarkContentType,
  ContentBookmark,
  ContentProgress,
  ProgressContentType,
} from "@/lib/content/types";

export async function getBookmarkedContentKeys(
  contentType: BookmarkContentType,
  keyPrefix?: string,
): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user) return new Set();

  const supabase = await createClient();
  let query = supabase
    .from("content_bookmarks")
    .select("content_key")
    .eq("user_id", user.id)
    .eq("content_type", contentType);

  if (keyPrefix) {
    query = query.like("content_key", `${keyPrefix}%`);
  }

  const { data } = await query;
  return new Set((data ?? []).map((row) => row.content_key));
}

export async function getLatestContentProgress(
  contentType: ProgressContentType,
): Promise<ContentProgress | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("content_progress")
    .select("content_type, content_key, data, updated_at")
    .eq("user_id", user.id)
    .eq("content_type", contentType)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    contentType: data.content_type,
    contentKey: data.content_key,
    data: (data.data as Record<string, unknown>) ?? {},
    updatedAt: data.updated_at,
  };
}

export async function getRecentContentBookmarks(
  contentType: BookmarkContentType,
  limit = 5,
): Promise<ContentBookmark[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("content_bookmarks")
    .select("content_type, content_key, data, created_at")
    .eq("user_id", user.id)
    .eq("content_type", contentType)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    contentType: row.content_type,
    contentKey: row.content_key,
    data: (row.data as Record<string, unknown>) ?? {},
    createdAt: row.created_at,
  }));
}
