import Planner from "@/components/Planner";
import { createClient } from "@/app/lib/supabase/server";
import { loadPlanConversations } from "./conversations";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PlanPageProps = {
  searchParams?: Promise<{
    mode?: string;
    new?: string;
    workspaceId?: string;
  }>;
};

function getInitialMode(mode: string | undefined, shouldStartFresh: boolean) {
  if (mode === "market") {
    return "market";
  }

  if (mode === "plan") {
    return "plan";
  }

  return shouldStartFresh ? "plan" : undefined;
}

export default async function PlanPage({ searchParams }: PlanPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("[plan auth missing]", userError?.message || "No authenticated user");
    redirect("/login?next=/plan");
  }

  const conversationResult = await loadPlanConversations(supabase, user);
  const params = searchParams ? await searchParams : {};
  const shouldStartFresh = params.new === "1" || params.new === "true";
  const initialMode = getInitialMode(params.mode, shouldStartFresh);

  return (
    <Planner
      initialConversations={conversationResult.conversations}
      conversationLoadError={conversationResult.error}
      initialWorkspaces={conversationResult.workspaces}
      initialReport={shouldStartFresh ? null : conversationResult.latestReport}
      initialMode={initialMode}
      initialWorkspaceId={params.workspaceId}
    />
  );
}
