import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { BookOpenText } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/design-system/components/button";
import type { Locale } from "@/i18n/routing";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <div className="bg-accent text-accent-foreground flex size-14 items-center justify-center rounded-2xl">
        <BookOpenText className="size-7" aria-hidden="true" />
      </div>
      <p className="text-primary text-sm font-medium tracking-widest uppercase">
        {t("eyebrow")}
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        {t("title")}
      </h1>
      <p className="text-muted-foreground max-w-xl text-lg text-balance">
        {t("subtitle")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button size="lg" asChild>
          <Link href="/quran">{t("cta")}</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/signup">{t("secondaryCta")}</Link>
        </Button>
      </div>
    </div>
  );
}
