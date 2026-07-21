import { getTranslations, setRequestLocale } from "next-intl/server";
import { getChapters } from "@/features/quran/api";
import { SurahList } from "@/features/quran/components/surah-list";
import type { Locale } from "@/i18n/routing";

export default async function QuranIndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Quran.SurahList");
  const chapters = await getChapters();

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <SurahList chapters={chapters} />
    </div>
  );
}
