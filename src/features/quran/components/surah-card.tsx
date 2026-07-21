"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card } from "@/design-system/components/card";
import { Badge } from "@/design-system/components/badge";
import type { Chapter } from "@/features/quran/types";

export function SurahCard({ chapter }: { chapter: Chapter }) {
  const t = useTranslations("Quran.SurahList");

  return (
    <Link
      href={`/quran/${chapter.id}`}
      className="focus-visible:outline-ring block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <Card className="hover:bg-secondary/50 flex items-center gap-4 p-4 transition-colors">
        <span className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium">
          {chapter.id}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate font-medium">
              {chapter.translatedName}
            </span>
            <span className="font-arabic-quran text-foreground shrink-0 text-lg">
              {chapter.nameArabic}
            </span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Badge variant="outline" className="text-xs">
              {chapter.revelationPlace === "makkah"
                ? t("meccan")
                : t("medinan")}
            </Badge>
            <span>{t("ayahCount", { count: chapter.versesCount })}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
