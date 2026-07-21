import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});
