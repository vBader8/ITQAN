"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { BookMarked, ChevronDown, RotateCw } from "lucide-react";
import { Button } from "@/design-system/components/button";
import { Skeleton } from "@/design-system/components/skeleton";
import { cn } from "@/lib/utils";
import { getTafsirAction } from "@/features/tafsir/actions";
import type { Tafsir } from "@/features/tafsir/api";

export function TafsirPanel({
  surahNumber,
  ayahNumber,
}: {
  surahNumber: number;
  ayahNumber: number;
}) {
  const t = useTranslations("Tafsir");
  const [open, setOpen] = useState(false);
  const [tafsir, setTafsir] = useState<Tafsir | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function load() {
    setError(null);
    startTransition(async () => {
      const result = await getTafsirAction(surahNumber, ayahNumber);
      if (result.error) {
        setError(result.error);
        return;
      }
      setTafsir(result.tafsir ?? null);
    });
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && !tafsir && !error) {
      load();
    }
  }

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        aria-expanded={open}
        className="text-muted-foreground -ms-2"
      >
        <BookMarked className="size-4" aria-hidden="true" />
        {t("toggle")}
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </Button>

      {open && (
        <div className="border-border bg-surface-muted mt-2 rounded-lg border p-4">
          {isPending && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}

          {!isPending && error && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-muted-foreground text-sm">{t("error")}</p>
              <Button variant="outline" size="sm" onClick={load}>
                <RotateCw className="size-4" aria-hidden="true" />
                {t("retry")}
              </Button>
            </div>
          )}

          {!isPending && !error && tafsir && (
            <div className="flex flex-col gap-2">
              <p dir="ltr" lang="en" className="text-sm leading-relaxed">
                {tafsir.text}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("source", { name: tafsir.resourceName })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
