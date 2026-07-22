import { useTranslations } from "next-intl";
import { Badge } from "@/design-system/components/badge";
import { Separator } from "@/design-system/components/separator";
import { BookmarkButton } from "@/features/hadith/components/bookmark-button";
import type { Hadith } from "@/features/hadith/types";

export function HadithItem({
  hadith,
  book,
  sectionNumber,
  showTranslation,
  isBookmarked,
  isAuthenticated,
}: {
  hadith: Hadith;
  book: string;
  sectionNumber: number;
  showTranslation: boolean;
  isBookmarked: boolean;
  isAuthenticated: boolean;
}) {
  const t = useTranslations("Hadith.Reader");

  return (
    <article
      data-hadith-number={hadith.hadithNumber}
      className="flex flex-col gap-3 py-6"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="bg-accent text-accent-foreground mt-1 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium">
          {hadith.hadithNumber}
        </span>
        <p
          dir="rtl"
          lang="ar"
          className="font-arabic-sans text-foreground flex-1 text-lg leading-loose"
        >
          {hadith.textArabic}
        </p>
        <BookmarkButton
          book={book}
          sectionNumber={sectionNumber}
          hadithNumber={hadith.hadithNumber}
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
          {hadith.textEnglish}
        </p>
      )}

      {hadith.grades.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground text-xs">{t("gradedBy")}</span>
          {hadith.grades.map((grade) => (
            <Badge key={grade.scholar} variant="outline" className="text-xs">
              {grade.scholar}: {grade.grade}
            </Badge>
          ))}
        </div>
      )}

      <Separator />
    </article>
  );
}
