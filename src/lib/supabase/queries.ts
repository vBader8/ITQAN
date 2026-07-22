import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export type UserRole = "member" | "moderator" | "scholar" | "admin";

/**
 * Returns the signed-in user's role, or null if signed out. No route or UI
 * currently enforces this — it lands ahead of the admin/moderation/
 * scholar-approval features that will (see docs/adr/0001-content-architecture.md).
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return data?.role ?? null;
}
