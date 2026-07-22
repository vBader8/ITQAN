/**
 * The addressing scheme every content type shares for bookmarks and
 * reading progress — see docs/adr/0001-content-architecture.md. Feature
 * modules (features/quran, features/hadith, and future ones) translate
 * their own domain shapes to/from this generic (content_type, content_key,
 * data) triple; nothing outside lib/content/ should query
 * content_bookmarks/content_progress directly.
 */
export type BookmarkContentType = "quran_ayah" | "hadith";
export type ProgressContentType = "quran" | "hadith";

export interface ContentBookmark {
  contentType: BookmarkContentType;
  contentKey: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export interface ContentProgress {
  contentType: ProgressContentType;
  contentKey: string;
  data: Record<string, unknown>;
  updatedAt: string;
}
