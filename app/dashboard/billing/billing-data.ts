import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  type AiRequestKind,
  getUserPlanTier,
  usageLimits,
} from "@/app/lib/ai/governance";
import {
  billingPlans,
  getPlanPriceState,
  getStripeConfiguration,
  getStripePublishableStatus,
} from "@/app/lib/billing/stripe";

type UsageRow = {
  endpoint?: string | null;
  status?: string | null;
  estimated_cost_usd?: number | string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
};

function startOfCurrentBillingPeriod() {
  const now = new Date();

  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function endOfCurrentBillingPeriod() {
  const now = new Date();

  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

function safeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function readQuotaMode(row: UsageRow): AiRequestKind | "unknown" {
  const metadataMode =
    typeof row.metadata?.quota_mode === "string" ? row.metadata.quota_mode : "";

  if (
    metadataMode === "simple_chat" ||
    metadataMode === "business_advice" ||
    metadataMode === "investment_advice" ||
    metadataMode === "report_generation" ||
    metadataMode === "market_analysis" ||
    metadataMode === "file_analysis"
  ) {
    return metadataMode;
  }

  if (row.endpoint === "/api/chat") {
    return "simple_chat";
  }

  if (row.endpoint === "/api/plan") {
    return "report_generation";
  }

  if (row.endpoint === "/api/market-analysis") {
    return "market_analysis";
  }

  return "unknown";
}

function countCompletedUsage(rows: UsageRow[], kind: AiRequestKind) {
  return rows.filter(
    (row) => row.status === "completed" && readQuotaMode(row) === kind
  ).length;
}

export async function loadBillingOverview(
  supabase: SupabaseClient,
  user: User
) {
  const planTier = await getUserPlanTier(supabase, user.id);
  const periodStart = startOfCurrentBillingPeriod();
  const periodEnd = endOfCurrentBillingPeriod();
  const { data, error } = await supabase
    .from("ai_usage_events")
    .select("endpoint,status,estimated_cost_usd,metadata,created_at")
    .eq("user_id", user.id)
    .gte("created_at", periodStart.toISOString())
    .lt("created_at", periodEnd.toISOString())
    .order("created_at", { ascending: false })
    .limit(1000);
  const usageRows = (data || []) as UsageRow[];
  const currentLimits = usageLimits[planTier];
  const aiChatsUsed =
    countCompletedUsage(usageRows, "simple_chat") +
    countCompletedUsage(usageRows, "business_advice") +
    countCompletedUsage(usageRows, "investment_advice") +
    countCompletedUsage(usageRows, "file_analysis");
  const reportsUsed = countCompletedUsage(usageRows, "report_generation");
  const marketAnalysisUsed = countCompletedUsage(usageRows, "market_analysis");
  const estimatedAiCostUsd = usageRows.reduce(
    (sum, row) => sum + safeNumber(row.estimated_cost_usd),
    0
  );
  const subscriptionStatus = planTier === "free" ? "Free plan" : "Active";

  return {
    planTier,
    subscriptionStatus,
    renewalDate: periodEnd.toISOString(),
    billingPeriod: {
      start: periodStart.toISOString(),
      end: periodEnd.toISOString(),
    },
    usageError: error?.message || "",
    usage: {
      aiChatsUsed,
      reportsUsed,
      marketAnalysisUsed,
      estimatedAiCostUsd,
      totalEvents: usageRows.length,
      remaining: {
        aiChats: Math.max(0, currentLimits.simple_chat.monthlyRequests - aiChatsUsed),
        reports: Math.max(0, currentLimits.report_generation.monthlyRequests - reportsUsed),
        marketAnalysis: Math.max(
          0,
          currentLimits.market_analysis.monthlyRequests - marketAnalysisUsed
        ),
      },
      limits: {
        aiChats: currentLimits.simple_chat.monthlyRequests,
        reports: currentLimits.report_generation.monthlyRequests,
        marketAnalysis: currentLimits.market_analysis.monthlyRequests,
      },
    },
    plans: billingPlans.map((plan) => ({
      ...plan,
      current: plan.databaseTier === planTier,
      priceState: getPlanPriceState(plan.id),
      supportedBySchema: Boolean(plan.databaseTier),
    })),
    stripe: {
      server: getStripeConfiguration(),
      publishable: getStripePublishableStatus(),
    },
    paymentMethod: null as null,
    invoices: [] as Array<never>,
    billingHistory: [] as Array<never>,
  };
}

export type BillingOverview = Awaited<ReturnType<typeof loadBillingOverview>>;
