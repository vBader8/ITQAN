import { BookMarked, BookOpen } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/design-system/components/card";
import { EmptyState } from "@/design-system/components/empty-state";
import { Button } from "@/design-system/components/button";
import { getChapter } from "@/features/quran/api";
import {
  getContinueReading,
  getRecentBookmarks,
} from "@/features/quran/queries";
import { getCollections } from "@/features/hadith/api";
import {
  getHadithContinueReading,
  getRecentHadithBookmarks,
} from "@/features/hadith/queries";
import { getCurrentUser } from "@/lib/supabase/queries";
import type { Locale } from "@/i18n/routing";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale });
  }

  const t = await getTranslations("Dashboard");
  const [
    quranProgress,
    quranBookmarks,
    hadithProgress,
    hadithBookmarks,
    hadithCollections,
  ] = await Promise.all([
    getContinueReading(),
    getRecentBookmarks(),
    getHadithContinueReading(),
    getRecentHadithBookmarks(),
    getCollections(),
  ]);

  const quranChapter = quranProgress
    ? await getChapter(quranProgress.surahNumber)
    : null;
  const hadithCollection = hadithProgress
    ? hadithCollections.find((c) => c.slug === hadithProgress.book)
    : null;

  const continueReadingItems = [
    quranChapter && quranProgress
      ? {
          key: "quran",
          href: `/quran/${quranProgress.surahNumber}`,
          title: quranChapter.translatedName,
          subtitle: quranChapter.nameArabic,
        }
      : null,
    hadithCollection && hadithProgress
      ? {
          key: "hadith",
          href: `/hadith/${hadithProgress.book}/${hadithProgress.sectionNumber}`,
          title: hadithCollection.name,
          subtitle: hadithCollection.nameArabic,
        }
      : null,
  ].filter((item) => item !== null);

  const bookmarkItems = [
    ...quranBookmarks.map((bookmark) => ({
      key: `quran-${bookmark.surahNumber}-${bookmark.ayahNumber}`,
      href: `/quran/${bookmark.surahNumber}`,
      label: t("bookmarkLabel", {
        surah: bookmark.surahNumber,
        ayah: bookmark.ayahNumber,
      }),
      createdAt: bookmark.createdAt,
    })),
    ...hadithBookmarks.map((bookmark) => ({
      key: `hadith-${bookmark.book}-${bookmark.hadithNumber}`,
      href: `/hadith/${bookmark.book}/${bookmark.sectionNumber}`,
      label: t("hadithBookmarkLabel", {
        collection:
          hadithCollections.find((c) => c.slug === bookmark.book)?.name ??
          bookmark.book,
        number: bookmark.hadithNumber,
      }),
      createdAt: bookmark.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("welcomeBack", { name: user!.email ?? "" })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("continueReading")}</CardTitle>
        </CardHeader>
        <CardContent>
          {continueReadingItems.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="size-6" aria-hidden="true" />}
              title={t("noReadingTitle")}
              action={
                <Button size="sm" asChild>
                  <Link href="/quran">{t("browseQuran")}</Link>
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-1">
              {continueReadingItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="hover:bg-secondary -m-2 flex items-center gap-3 rounded-md p-2 transition-colors"
                  >
                    <span className="bg-accent text-accent-foreground flex size-10 items-center justify-center rounded-full">
                      <BookOpen className="size-5" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-muted-foreground text-sm">
                        {item.subtitle}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("bookmarks")}</CardTitle>
        </CardHeader>
        <CardContent>
          {bookmarkItems.length === 0 ? (
            <EmptyState
              icon={<BookMarked className="size-6" aria-hidden="true" />}
              title={t("noBookmarksTitle")}
              description={t("noBookmarksDescription")}
              action={
                <Button size="sm" variant="outline" asChild>
                  <Link href="/quran">{t("browseQuran")}</Link>
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {bookmarkItems.map((bookmark) => (
                <li key={bookmark.key}>
                  <Link
                    href={bookmark.href}
                    className="hover:bg-secondary -m-2 flex items-center gap-2 rounded-md p-2 text-sm transition-colors"
                  >
                    <BookMarked
                      className="text-primary size-4"
                      aria-hidden="true"
                    />
                    {bookmark.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
