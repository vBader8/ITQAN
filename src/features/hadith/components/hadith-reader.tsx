"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/design-system/components/label";
import { Switch } from "@/design-system/components/switch";
import { HadithItem } from "@/features/hadith/components/hadith-item";
import type { Hadith } from "@/features/hadith/types";

export function HadithReader({ hadiths }: { hadiths: Hadith[] }) {
  const t = useTranslations("Hadith.Reader");
  const [showTranslation, setShowTranslation] = useState(true);

  return (
    <div>
      <div className="border-border mb-2 flex items-center justify-end gap-2 border-b pb-4">
        <Label htmlFor="show-translation" className="cursor-pointer">
          {showTranslation ? t("showTranslation") : t("hideTranslation")}
        </Label>
        <Switch
          id="show-translation"
          checked={showTranslation}
          onCheckedChange={setShowTranslation}
        />
      </div>

      {hadiths.map((hadith) => (
        <HadithItem
          key={hadith.hadithNumber}
          hadith={hadith}
          showTranslation={showTranslation}
        />
      ))}
    </div>
  );
}
