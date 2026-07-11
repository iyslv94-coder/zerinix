import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getRegisterRouteState } from "@/app/register/register-access.mjs";

export async function redirectAuthenticatedUserFromAuthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const branch = getRegisterRouteState(user);

  if (branch === "redirect_dashboard") {
    redirect("/dashboard");
  }
}
