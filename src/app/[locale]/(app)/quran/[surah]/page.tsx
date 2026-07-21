import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getChapter, getChapterVerses } from "@/features/quran/api";
import { getBookmarkedAyahs, getCurrentUser } from "@/features/quran/queries";
import { ReaderView } from "@/features/quran/components/reader-view";
import { Link } from "@/i18n/navigation";
import { Button } from "@/design-system/components/button";
import type { Locale } from "@/i18n/routing";

export default async function SurahPage({
  params,
}: {
  params: Promise<{ locale: Locale; surah: string }>;
}) {
  const { locale, surah } = await params;
  setRequestLocale(locale);

  const surahNumber = Number(surah);
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    notFound();
  }

  const t = await getTranslations("Quran.Reader");
  const [chapter, verses, bookmarkedAyahs, user] = await Promise.all([
    getChapter(surahNumber),
    getChapterVerses(surahNumber),
    getBookmarkedAyahs(surahNumber),
    getCurrentUser(),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col items-center gap-1 text-center">
        <p className="font-arabic-quran text-4xl">{chapter.nameArabic}</p>
        <h1 dir="ltr" className="text-xl font-semibold tracking-tight">
          {chapter.id}. {chapter.translatedName}
        </h1>
      </div>

      <ReaderView
        surahNumber={surahNumber}
        verses={verses}
        bookmarkedAyahs={Array.from(bookmarkedAyahs)}
        isAuthenticated={Boolean(user)}
      />

      <nav className="border-border mt-8 flex items-center justify-between border-t pt-6">
        {surahNumber > 1 ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/quran/${surahNumber - 1}`}>
              <ChevronLeft className="rtl:hidden" aria-hidden="true" />
              <ChevronRight className="hidden rtl:block" aria-hidden="true" />
              {t("previousSurah")}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {surahNumber < 114 ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/quran/${surahNumber + 1}`}>
              {t("nextSurah")}
              <ChevronRight className="rtl:hidden" aria-hidden="true" />
              <ChevronLeft className="hidden rtl:block" aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
