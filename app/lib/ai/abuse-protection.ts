import type { SupabaseClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/app/lib/security/rate-limit";
import { logServerError } from "@/app/lib/security/errors";
import type { AIUsageOperationType } from "@/app/lib/ai/governance";

export type AIAbuseEventType =
  | "rate_limit"
  | "duplicate_request"
  | "oversized_input"
  | "suspicious_activity";

export type AIAbuseEvent = {
  id: string;
  userId: string;
  type: AIAbuseEventType;
  metadata: Record<string, unknown>;
  createdAt: string;
};

type AbuseGuardInput = {
  supabase: SupabaseClient;
  userId: string;
  endpoint: string;
  operationType: AIUsageOperationType;
  promptText: string;
  promptHash: string;
  reportField?: string;
  reportRequestId?: string;
  ip: string;
};

const defaultAiAbuseConfig = {
  maxInputCharacters: {
    chat: 20_000,
    plan_report: 60_000,
    market_report: 60_000,
    executive_report: 60_000,
    pdf_export: 0,
  },
  perUserRequestsPerMinute: 50,
  perUserRequestsPerHour: 500,
  perIpBurstPerMinute: 120,
  duplicateWindowSeconds: 45,
  duplicateThreshold: 6,
  regenerationWindowSeconds: 300,
  regenerationThreshold: 8,
};

function readPositiveNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : fallback;
}

function getAiAbuseConfig() {
  const rawConfig = process.env.AI_ABUSE_CONFIG;

  if (!rawConfig) {
    return defaultAiAbuseConfig;
  }

  try {
    const parsed = JSON.parse(rawConfig) as Record<string, unknown>;
    const maxInput =
      parsed.maxInputCharacters && typeof parsed.maxInputCharacters === "object"
        ? parsed.maxInputCharacters as Record<string, unknown>
        : {};

    return {
      maxInputCharacters: {
        chat: readPositiveNumber(maxInput.chat, defaultAiAbuseConfig.maxInputCharacters.chat),
        plan_report: readPositiveNumber(maxInput.plan_report, defaultAiAbuseConfig.maxInputCharacters.plan_report),
        market_report: readPositiveNumber(maxInput.market_report, defaultAiAbuseConfig.maxInputCharacters.market_report),
        executive_report: readPositiveNumber(maxInput.executive_report, defaultAiAbuseConfig.maxInputCharacters.executive_report),
        pdf_export: readPositiveNumber(maxInput.pdf_export, defaultAiAbuseConfig.maxInputCharacters.pdf_export),
      },
      perUserRequestsPerMinute: readPositiveNumber(parsed.perUserRequestsPerMinute, defaultAiAbuseConfig.perUserRequestsPerMinute),
      perUserRequestsPerHour: readPositiveNumber(parsed.perUserRequestsPerHour, defaultAiAbuseConfig.perUserRequestsPerHour),
      perIpBurstPerMinute: readPositiveNumber(parsed.perIpBurstPerMinute, defaultAiAbuseConfig.perIpBurstPerMinute),
      duplicateWindowSeconds: readPositiveNumber(parsed.duplicateWindowSeconds, defaultAiAbuseConfig.duplicateWindowSeconds),
      duplicateThreshold: readPositiveNumber(parsed.duplicateThreshold, defaultAiAbuseConfig.duplicateThreshold),
      regenerationWindowSeconds: readPositiveNumber(parsed.regenerationWindowSeconds, defaultAiAbuseConfig.regenerationWindowSeconds),
      regenerationThreshold: readPositiveNumber(parsed.regenerationThreshold, defaultAiAbuseConfig.regenerationThreshold),
    };
  } catch {
    return defaultAiAbuseConfig;
  }
}

export async function recordAIAbuseEvent(
  supabase: SupabaseClient,
  input: {
    userId: string;
    type: AIAbuseEventType;
    metadata: Record<string, unknown>;
  }
) {
  const { error } = await supabase.from("ai_abuse_events").insert({
    user_id: input.userId,
    type: input.type,
    metadata: input.metadata,
  });

  if (error && !/ai_abuse_events|relation|table/i.test(error.message || "")) {
    logServerError("ai-abuse:event-write", error);
  }
}

async function countRecentMatchingUsage(
  supabase: SupabaseClient,
  input: {
    userId: string;
    endpoint: string;
    promptHash: string;
    reportField?: string;
    sinceIso: string;
  }
) {
  let query = supabase
    .from("ai_usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", input.userId)
    .eq("endpoint", input.endpoint)
    .eq("prompt_hash", input.promptHash)
    .gte("created_at", input.sinceIso);

  if (input.reportField) {
    query = query.eq("report_field", input.reportField);
  }

  const { count, error } = await query;

  if (error) {
    logServerError("ai-abuse:duplicate-check", error);
    return 0;
  }

  return count ?? 0;
}

async function blockRequest(
  supabase: SupabaseClient,
  input: AbuseGuardInput & {
    type: AIAbuseEventType;
    reason: string;
    metadata: Record<string, unknown>;
  }
) {
  await recordAIAbuseEvent(supabase, {
    userId: input.userId,
    type: input.type,
    metadata: {
      endpoint: input.endpoint,
      operation_type: input.operationType,
      report_field: input.reportField ?? null,
      report_request_id: input.reportRequestId ?? null,
      prompt_hash: input.promptHash,
      ip: input.ip,
      reason: input.reason,
      ...input.metadata,
    },
  });

  return {
    allowed: false,
    type: input.type,
    reason: input.reason,
  };
}

export async function checkAIAbuseProtection(input: AbuseGuardInput): Promise<{
  allowed: boolean;
  type?: AIAbuseEventType;
  reason?: string;
}> {
  const config = getAiAbuseConfig();
  const promptLength = input.promptText.trim().length;
  const maxInputCharacters = config.maxInputCharacters[input.operationType] ?? 0;

  if (promptLength === 0) {
    return blockRequest(input.supabase, {
      ...input,
      type: "oversized_input",
      reason: "A valid request is required.",
      metadata: { promptLength, maxInputCharacters },
    });
  }

  if (maxInputCharacters > 0 && promptLength > maxInputCharacters) {
    return blockRequest(input.supabase, {
      ...input,
      type: "oversized_input",
      reason: "Request is too large. Please shorten your input and try again.",
      metadata: { promptLength, maxInputCharacters },
    });
  }

  const userMinute = checkRateLimit(`ai-abuse:user-minute:${input.userId}`, {
    limit: config.perUserRequestsPerMinute,
    windowMs: 60_000,
  });

  if (!userMinute.allowed) {
    return blockRequest(input.supabase, {
      ...input,
      type: "rate_limit",
      reason: "Too many AI requests. Please wait a moment and try again.",
      metadata: { scope: "user", window: "minute", remaining: userMinute.remaining },
    });
  }

  const userHour = checkRateLimit(`ai-abuse:user-hour:${input.userId}`, {
    limit: config.perUserRequestsPerHour,
    windowMs: 60 * 60_000,
  });

  if (!userHour.allowed) {
    return blockRequest(input.supabase, {
      ...input,
      type: "rate_limit",
      reason: "Hourly AI request limit reached. Please wait before trying again.",
      metadata: { scope: "user", window: "hour", remaining: userHour.remaining },
    });
  }

  const ipBurst = checkRateLimit(`ai-abuse:ip-burst:${input.ip}`, {
    limit: config.perIpBurstPerMinute,
    windowMs: 60_000,
  });

  if (!ipBurst.allowed) {
    return blockRequest(input.supabase, {
      ...input,
      type: "suspicious_activity",
      reason: "Suspicious request burst detected. Please wait a moment and try again.",
      metadata: { scope: "ip", window: "minute", remaining: ipBurst.remaining },
    });
  }

  const duplicateSince = new Date(
    Date.now() - config.duplicateWindowSeconds * 1_000
  ).toISOString();
  const duplicateCount = await countRecentMatchingUsage(input.supabase, {
    userId: input.userId,
    endpoint: input.endpoint,
    promptHash: input.promptHash,
    reportField: input.reportField,
    sinceIso: duplicateSince,
  });

  if (duplicateCount >= config.duplicateThreshold) {
    return blockRequest(input.supabase, {
      ...input,
      type: "duplicate_request",
      reason: "Repeated identical AI requests detected. Please wait before retrying.",
      metadata: {
        duplicateCount,
        duplicateWindowSeconds: config.duplicateWindowSeconds,
      },
    });
  }

  if (input.reportRequestId && input.reportField) {
    const regenerationSince = new Date(
      Date.now() - config.regenerationWindowSeconds * 1_000
    ).toISOString();
    const regenerationCount = await countRecentMatchingUsage(input.supabase, {
      userId: input.userId,
      endpoint: input.endpoint,
      promptHash: input.promptHash,
      reportField: input.reportField,
      sinceIso: regenerationSince,
    });

    if (regenerationCount >= config.regenerationThreshold) {
      return blockRequest(input.supabase, {
        ...input,
        type: "suspicious_activity",
        reason: "Rapid report regeneration detected. Please wait before retrying.",
        metadata: {
          regenerationCount,
          regenerationWindowSeconds: config.regenerationWindowSeconds,
        },
      });
    }
  }

  return { allowed: true };
}
