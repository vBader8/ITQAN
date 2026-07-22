import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  getCollections,
  getSectionHadiths,
  getSections,
} from "@/features/hadith/api";
import { HadithReader } from "@/features/hadith/components/hadith-reader";
import type { Locale } from "@/i18n/routing";

export default async function HadithSectionPage({
  params,
}: {
  params: Promise<{ locale: Locale; book: string; section: string }>;
}) {
  const { locale, book, section } = await params;
  setRequestLocale(locale);

  const sectionNumber = Number(section);
  if (!Number.isInteger(sectionNumber) || sectionNumber < 1) {
    notFound();
  }

  const collections = await getCollections();
  const collection = collections.find((c) => c.slug === book);
  if (!collection) {
    notFound();
  }

  const sections = await getSections(book);
  const sectionInfo = sections.find((s) => s.number === sectionNumber);
  if (!sectionInfo) {
    notFound();
  }

  const hadiths = await getSectionHadiths(book, sectionNumber);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col items-center gap-1 text-center">
        <p className="font-arabic-sans text-xl">{collection.nameArabic}</p>
        <h1 className="text-xl font-semibold tracking-tight">
          {sectionInfo.name}
        </h1>
      </div>
      <HadithReader hadiths={hadiths} />
    </div>
  );
}
