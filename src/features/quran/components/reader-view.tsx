"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/design-system/components/label";
import { Switch } from "@/design-system/components/switch";
import { Ayah } from "@/features/quran/components/ayah";
import { useReadingProgress } from "@/features/quran/hooks/use-reading-progress";
import type { Verse } from "@/features/quran/types";

export function ReaderView({
  surahNumber,
  verses,
  bookmarkedAyahs,
  isAuthenticated,
}: {
  surahNumber: number;
  verses: Verse[];
  bookmarkedAyahs: number[];
  isAuthenticated: boolean;
}) {
  const t = useTranslations("Quran.Reader");
  const [showTranslation, setShowTranslation] = useState(true);
  const bookmarkedSet = new Set(bookmarkedAyahs);
  const containerRef = useReadingProgress(surahNumber, isAuthenticated);

  return (
    <div>
      <div className="border-border mb-2 flex items-center justify-end gap-2 border-b pb-4">
        <Label htmlFor="show-translation" className="cursor-pointer">
          {showTranslation ? t("showTranslation") : t("hideTranslation")}
        </Label>
        <Switch
          id="show-translation"
          checked={showTranslation}
          onCheckedChange={setShowTranslation}
        />
      </div>

      <div ref={containerRef} className="divide-y-0">
        {verses.map((verse) => (
          <Ayah
            key={verse.id}
            verse={verse}
            surahNumber={surahNumber}
            showTranslation={showTranslation}
            isBookmarked={bookmarkedSet.has(verse.verseNumber)}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </div>
  );
}
