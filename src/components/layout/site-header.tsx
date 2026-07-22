import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/design-system/components/button";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { UserMenu } from "@/components/layout/user-menu";

export async function SiteHeader() {
  const locale = await getLocale();
  const t = await getTranslations("Nav");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          ITQAN
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/quran">{t("quran")}</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/hadith">{t("hadith")}</Link>
          </Button>

          <LocaleSwitcher />

          {user?.email ? (
            <UserMenu email={user.email} locale={locale} />
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/signup">{t("signup")}</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
