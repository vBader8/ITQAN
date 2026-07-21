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
  getCurrentUser,
  getRecentBookmarks,
} from "@/features/quran/queries";
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
  const [continueReading, bookmarks] = await Promise.all([
    getContinueReading(),
    getRecentBookmarks(),
  ]);

  const continueReadingChapter = continueReading
    ? await getChapter(continueReading.surahNumber)
    : null;

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
          {continueReadingChapter && continueReading ? (
            <Link
              href={`/quran/${continueReading.surahNumber}`}
              className="hover:bg-secondary -m-2 flex items-center gap-3 rounded-md p-2 transition-colors"
            >
              <span className="bg-accent text-accent-foreground flex size-10 items-center justify-center rounded-full">
                <BookOpen className="size-5" aria-hidden="true" />
              </span>
              <span className="flex flex-col">
                <span className="font-medium">
                  {continueReadingChapter.translatedName}
                </span>
                <span className="text-muted-foreground text-sm">
                  {continueReadingChapter.nameArabic}
                </span>
              </span>
            </Link>
          ) : (
            <EmptyState
              icon={<BookOpen className="size-6" aria-hidden="true" />}
              title={t("noReadingTitle")}
              action={
                <Button size="sm" asChild>
                  <Link href="/quran">{t("browseQuran")}</Link>
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("bookmarks")}</CardTitle>
        </CardHeader>
        <CardContent>
          {bookmarks.length === 0 ? (
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
              {bookmarks.map((bookmark) => (
                <li key={`${bookmark.surahNumber}-${bookmark.ayahNumber}`}>
                  <Link
                    href={`/quran/${bookmark.surahNumber}`}
                    className="hover:bg-secondary -m-2 flex items-center gap-2 rounded-md p-2 text-sm transition-colors"
                  >
                    <BookMarked
                      className="text-primary size-4"
                      aria-hidden="true"
                    />
                    {t("bookmarkLabel", {
                      surah: bookmark.surahNumber,
                      ayah: bookmark.ayahNumber,
                    })}
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
