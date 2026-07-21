"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/design-system/components/input";
import { EmptyState } from "@/design-system/components/empty-state";
import { SurahCard } from "@/features/quran/components/surah-card";
import type { Chapter } from "@/features/quran/types";

export function SurahList({ chapters }: { chapters: Chapter[] }) {
  const t = useTranslations("Quran.SurahList");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return chapters;
    return chapters.filter(
      (chapter) =>
        chapter.nameSimple.toLowerCase().includes(normalized) ||
        chapter.translatedName.toLowerCase().includes(normalized) ||
        chapter.nameArabic.includes(normalized) ||
        String(chapter.id) === normalized,
    );
  }, [chapters, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search
          className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="ps-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t("empty")} />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((chapter) => (
            <li key={chapter.id}>
              <SurahCard chapter={chapter} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
