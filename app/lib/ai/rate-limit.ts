import type { SupabaseClient } from "@supabase/supabase-js";
import {
  checkUsageAllowance,
  dailyAiLimitMessage,
  getUserPlanTier,
  hashAiPayload,
  recordAiUsage,
  selectAiModel,
  type AiRequestKind,
} from "@/app/lib/ai/governance";

type AiProductionRateLimitInput = {
  supabase: SupabaseClient;
  userId: string;
  endpoint: string;
  requestKind: AiRequestKind;
  promptText: string;
  reportField?: string;
  ip: string;
};

export async function checkAiProductionRateLimit({
  supabase,
  userId,
  endpoint,
  requestKind,
  promptText,
  reportField,
  ip,
}: AiProductionRateLimitInput) {
  const planTier = await getUserPlanTier(supabase, userId);
  const model = selectAiModel(requestKind);
  const promptHash = hashAiPayload(promptText);
  const allowance = await checkUsageAllowance(supabase, userId, planTier);

  if (!allowance.allowed) {
    await recordAiUsage(supabase, {
      userId,
      endpoint,
      reportField,
      promptHash,
      model,
      planTier,
      tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      estimatedCostUsd: 0,
      cacheHit: false,
      status: "rate_limited",
      responseTimeMs: 0,
      metadata: {
        reason: dailyAiLimitMessage,
        dailyUsed: allowance.dailyUsed,
        dailyRequests: allowance.dailyRequests,
        monthlyUsed: allowance.monthlyUsed,
        monthlyRequests: allowance.monthlyRequests,
        limitKey: userId || ip,
        limitScope: userId ? "user" : "ip",
      },
    });
  }

  return {
    ...allowance,
    model,
    planTier,
    promptHash,
  };
}
