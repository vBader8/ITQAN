import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCollections } from "@/features/hadith/api";
import { CollectionCard } from "@/features/hadith/components/collection-card";
import type { Locale } from "@/i18n/routing";

export default async function HadithIndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Hadith.Collections");
  const collections = await getCollections();

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {collections.map((collection) => (
          <li key={collection.slug}>
            <CollectionCard collection={collection} />
          </li>
        ))}
      </ul>
    </div>
  );
}
