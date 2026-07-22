import { Sparkles } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmptyState } from "@/design-system/components/empty-state";
import { AssistantChat } from "@/features/assistant/components/assistant-chat";
import type { Locale } from "@/i18n/routing";

export default async function AssistantPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Assistant");

  const isConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("disclaimer")}</p>
      </div>

      {isConfigured ? (
        <AssistantChat />
      ) : (
        <EmptyState
          icon={<Sparkles className="size-6" aria-hidden="true" />}
          title={t("notConfiguredTitle")}
          description={t("notConfiguredDescription")}
        />
      )}
    </div>
  );
}
