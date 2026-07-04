"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { getAuthenticatedUser } from "./report-utils";

async function getWorkspaceContext() {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  if (!user) {
    return null;
  }

  return { supabase, user };
}

export async function createWorkspace(formData: FormData) {
  const name = String(formData.get("name") || "").trim();

  if (!name) {
    return;
  }

  const context = await getWorkspaceContext();

  if (!context) {
    return;
  }

  await context.supabase.from("report_workspaces").insert({
    user_id: context.user.id,
    name,
  });

  revalidatePath("/dashboard");
}

export async function renameWorkspace(formData: FormData) {
  const workspaceId = String(formData.get("workspace_id") || "");
  const name = String(formData.get("name") || "").trim();

  if (!workspaceId || !name) {
    return;
  }

  const context = await getWorkspaceContext();

  if (!context) {
    return;
  }

  await context.supabase
    .from("report_workspaces")
    .update({ name })
    .eq("id", workspaceId)
    .eq("user_id", context.user.id);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/workspaces/${workspaceId}`);
}

export async function deleteWorkspace(formData: FormData) {
  const workspaceId = String(formData.get("workspace_id") || "");

  if (!workspaceId) {
    return;
  }

  const context = await getWorkspaceContext();

  if (!context) {
    return;
  }

  const { count } = await context.supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", context.user.id)
    .eq("workspace_id", workspaceId);

  if ((count || 0) > 0) {
    return;
  }

  await context.supabase
    .from("report_workspaces")
    .delete()
    .eq("id", workspaceId)
    .eq("user_id", context.user.id);

  revalidatePath("/dashboard");
}
