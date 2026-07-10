import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";
import { getRegisterRouteState } from "@/app/register/register-access.mjs";

function hasSupabaseAuthCookies(cookieNames: string[]) {
  return cookieNames.some((name) => name.startsWith("sb-"));
}

export async function redirectAuthenticatedUserFromAuthPage(pathname: string) {
  const cookieStore = await cookies();
  const authCookiesPresent = hasSupabaseAuthCookies(
    cookieStore.getAll().map((cookie) => cookie.name)
  );
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const branch = getRegisterRouteState(user);

  console.log("[auth-guard:page]", {
    pathname,
    authCookiesPresent,
    userEmail: user?.email ?? null,
    branch,
  });

  if (branch === "redirect_dashboard") {
    redirect("/dashboard");
  }
}
