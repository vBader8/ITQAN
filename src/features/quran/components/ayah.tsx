import { useTranslations } from "next-intl";
import { Separator } from "@/design-system/components/separator";
import { BookmarkButton } from "@/features/quran/components/bookmark-button";
import type { Verse } from "@/features/quran/types";

export function Ayah({
  verse,
  surahNumber,
  showTranslation,
  isBookmarked,
  isAuthenticated,
}: {
  verse: Verse;
  surahNumber: number;
  showTranslation: boolean;
  isBookmarked: boolean;
  isAuthenticated: boolean;
}) {
  const t = useTranslations("Quran.Reader");

  return (
    <article
      data-ayah-number={verse.verseNumber}
      className="flex flex-col gap-3 py-6"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="bg-accent text-accent-foreground mt-1 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium">
          {verse.verseNumber}
        </span>
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic-quran text-foreground flex-1 text-2xl leading-loose sm:text-3xl"
        >
          {verse.textUthmani}
        </p>
        <BookmarkButton
          surahNumber={surahNumber}
          ayahNumber={verse.verseNumber}
          initialBookmarked={isBookmarked}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {showTranslation && (
        <p
          dir="ltr"
          lang="en"
          className="text-muted-foreground text-base leading-relaxed"
        >
          <span className="sr-only">
            {t("verse", { number: verse.verseNumber })}
          </span>
          {verse.translation}
        </p>
      )}
      <Separator />
    </article>
  );
}
