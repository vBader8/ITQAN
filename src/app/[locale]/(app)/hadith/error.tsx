"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@/design-system/components/error-state";

export default function HadithError({ reset }: { reset: () => void }) {
  const t = useTranslations("Common");

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <ErrorState
        title={t("errorTitle")}
        description={t("errorDescription")}
        retryLabel={t("retry")}
        onRetry={reset}
      />
    </div>
  );
}
