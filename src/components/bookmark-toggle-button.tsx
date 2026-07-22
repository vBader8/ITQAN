"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/design-system/components/button";

export interface ToggleBookmarkResult {
  bookmarked: boolean;
  error?: string;
}

export function BookmarkToggleButton({
  initialBookmarked,
  isAuthenticated,
  onToggle,
  bookmarkLabel,
  bookmarkedLabel,
  authRequiredMessage,
}: {
  initialBookmarked: boolean;
  isAuthenticated: boolean;
  onToggle: () => Promise<ToggleBookmarkResult>;
  bookmarkLabel: string;
  bookmarkedLabel: string;
  authRequiredMessage: string;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isAuthenticated) {
      toast.info(authRequiredMessage);
      return;
    }

    startTransition(async () => {
      const result = await onToggle();
      if (result.error) {
        toast.error(authRequiredMessage);
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
      aria-label={bookmarked ? bookmarkedLabel : bookmarkLabel}
      title={bookmarked ? bookmarkedLabel : bookmarkLabel}
    >
      {bookmarked ? (
        <BookmarkCheck className="text-primary" aria-hidden="true" />
      ) : (
        <Bookmark aria-hidden="true" />
      )}
    </Button>
  );
}
