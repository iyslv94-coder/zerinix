import AIChatWorkspace from "@/components/AIChatWorkspace";
import { createClient } from "@/app/lib/supabase/server";
import { loadPlanConversations } from "@/app/plan/conversations";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("[chat auth missing]", userError?.message || "No authenticated user");
    redirect("/login?next=/chat");
  }

  const conversationResult = await loadPlanConversations(supabase, user);

  return (
    <AIChatWorkspace
      initialConversations={conversationResult.conversations}
      conversationLoadError={conversationResult.error}
    />
  );
}
