"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import {
  checkRateLimit,
  getServerActionClientIp,
} from "@/app/lib/security/rate-limit";
import { getAuthenticatedUser } from "./report-utils";

const MAX_WORKSPACE_NAME_LENGTH = 80;

async function getWorkspaceContext() {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  if (!user) {
    return null;
  }

  const ip = await getServerActionClientIp();
  const rateLimit = checkRateLimit(`workspace:mutation:${user.id}:${ip}`, {
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return null;
  }

  return { supabase, user };
}

function normalizeWorkspaceName(formData: FormData) {
  return String(formData.get("name") || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_WORKSPACE_NAME_LENGTH);
}

export async function createWorkspace(formData: FormData) {
  const name = normalizeWorkspaceName(formData);

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
  const name = normalizeWorkspaceName(formData);

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
