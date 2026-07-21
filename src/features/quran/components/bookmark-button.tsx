"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/design-system/components/button";
import { toggleBookmarkAction } from "@/features/quran/actions";

export function BookmarkButton({
  surahNumber,
  ayahNumber,
  initialBookmarked,
  isAuthenticated,
}: {
  surahNumber: number;
  ayahNumber: number;
  initialBookmarked: boolean;
  isAuthenticated: boolean;
}) {
  const t = useTranslations("Quran.Reader");
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isAuthenticated) {
      toast.info(t("bookmarkRequiresAuth"));
      return;
    }

    startTransition(async () => {
      const result = await toggleBookmarkAction(surahNumber, ayahNumber);
      if (result.error) {
        toast.error(t("bookmarkRequiresAuth"));
        return;
      }
      setBookmarked(result.bookmarked);
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? t("bookmarked") : t("bookmark")}
      title={bookmarked ? t("bookmarked") : t("bookmark")}
    >
      {bookmarked ? (
        <BookmarkCheck className="text-primary" aria-hidden="true" />
      ) : (
        <Bookmark aria-hidden="true" />
      )}
    </Button>
  );
}
