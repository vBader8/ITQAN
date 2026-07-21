"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/design-system/components/button";
import { Input } from "@/design-system/components/input";
import { Label } from "@/design-system/components/label";
import { signInAction, type AuthActionState } from "@/features/auth/actions";

const initialState: AuthActionState = {};

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("Auth.Login");
  const [state, formAction, pending] = useActionState(
    signInAction.bind(null, locale),
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state.error && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}

      <Button type="submit" loading={pending} className="mt-2">
        {pending ? t("submitting") : t("submit")}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        {t("noAccount")}{" "}
        <Link
          href="/signup"
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          {t("signUpLink")}
        </Link>
      </p>
    </form>
  );
}
