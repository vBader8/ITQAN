"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/design-system/components/button";
import { Input } from "@/design-system/components/input";
import { Label } from "@/design-system/components/label";
import { signUpAction, type AuthActionState } from "@/features/auth/actions";

const initialState: AuthActionState = {};

export function SignupForm({ locale }: { locale: string }) {
  const t = useTranslations("Auth.Signup");
  const [state, formAction, pending] = useActionState(
    signUpAction.bind(null, locale),
    initialState,
  );
  const submitted = !pending && !state.error && state.submittedAt !== undefined;

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
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {state.error && (
        <p role="alert" className="text-destructive text-sm">
          {state.error}
        </p>
      )}

      {submitted && (
        <p role="status" className="text-primary text-sm">
          {t("checkEmail")}
        </p>
      )}

      <Button type="submit" loading={pending} className="mt-2">
        {pending ? t("submitting") : t("submit")}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        {t("haveAccount")}{" "}
        <Link
          href="/login"
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}
