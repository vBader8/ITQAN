"use client";

import { useTranslations } from "next-intl";
import { BookmarkToggleButton } from "@/components/bookmark-toggle-button";
import { toggleHadithBookmarkAction } from "@/features/hadith/actions";

export function BookmarkButton({
  book,
  sectionNumber,
  hadithNumber,
  initialBookmarked,
  isAuthenticated,
}: {
  book: string;
  sectionNumber: number;
  hadithNumber: number;
  initialBookmarked: boolean;
  isAuthenticated: boolean;
}) {
  const t = useTranslations("Hadith.Reader");

  return (
    <BookmarkToggleButton
      initialBookmarked={initialBookmarked}
      isAuthenticated={isAuthenticated}
      onToggle={() =>
        toggleHadithBookmarkAction(book, sectionNumber, hadithNumber)
      }
      bookmarkLabel={t("bookmark")}
      bookmarkedLabel={t("bookmarked")}
      authRequiredMessage={t("bookmarkRequiresAuth")}
    />
  );
}
