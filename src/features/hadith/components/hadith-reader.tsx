"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/design-system/components/label";
import { Switch } from "@/design-system/components/switch";
import { HadithItem } from "@/features/hadith/components/hadith-item";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { saveHadithProgressAction } from "@/features/hadith/actions";
import type { Hadith } from "@/features/hadith/types";

export function HadithReader({
  book,
  sectionNumber,
  hadiths,
  bookmarkedHadiths,
  isAuthenticated,
}: {
  book: string;
  sectionNumber: number;
  hadiths: Hadith[];
  bookmarkedHadiths: number[];
  isAuthenticated: boolean;
}) {
  const t = useTranslations("Hadith.Reader");
  const [showTranslation, setShowTranslation] = useState(true);
  const bookmarkedSet = new Set(bookmarkedHadiths);
  const containerRef = useScrollProgress({
    attribute: "hadith-number",
    isAuthenticated,
    onProgress: (hadithNumber) => {
      void saveHadithProgressAction(book, sectionNumber, hadithNumber);
    },
  });

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

      <div ref={containerRef}>
        {hadiths.map((hadith) => (
          <HadithItem
            key={hadith.hadithNumber}
            hadith={hadith}
            book={book}
            sectionNumber={sectionNumber}
            showTranslation={showTranslation}
            isBookmarked={bookmarkedSet.has(hadith.hadithNumber)}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </div>
  );
}
