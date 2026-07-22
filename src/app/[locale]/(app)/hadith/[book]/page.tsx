import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCollections, getSections } from "@/features/hadith/api";
import { SectionList } from "@/features/hadith/components/section-list";
import type { Locale } from "@/i18n/routing";

export default async function HadithCollectionPage({
  params,
}: {
  params: Promise<{ locale: Locale; book: string }>;
}) {
  const { locale, book } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Hadith.Sections");

  const collections = await getCollections();
  const collection = collections.find((c) => c.slug === book);
  if (!collection) {
    notFound();
  }

  const sections = await getSections(book);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col items-center gap-1 text-center">
        <p className="font-arabic-sans text-3xl">{collection.nameArabic}</p>
        <h1 className="text-xl font-semibold tracking-tight">
          {collection.name}
        </h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>
      <SectionList book={book} sections={sections} />
    </div>
  );
}
