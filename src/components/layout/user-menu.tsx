"use client";

import { useTranslations } from "next-intl";
import { LogOut, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system/components/dropdown-menu";
import { Avatar, AvatarFallback } from "@/design-system/components/avatar";
import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/features/auth/actions";

export function UserMenu({ email, locale }: { email: string; locale: string }) {
  const t = useTranslations("Nav");
  const initial = email.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="focus-visible:outline-ring rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label={email}
        >
          <Avatar>
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="text-muted-foreground truncate px-2 py-1.5 text-sm">
          {email}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutDashboard />
            {t("dashboard")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOutAction.bind(null, locale)}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut />
              {t("logout")}
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
