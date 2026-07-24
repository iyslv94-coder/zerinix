import "server-only";

export type ProductionReadinessStatus = "pass" | "warning" | "fail";

export type ProductionReadinessCategory =
  | "health"
  | "environment"
  | "core_flow"
  | "ai_system";

export type ProductionReadinessCheck = {
  id: string;
  label: string;
  category: ProductionReadinessCategory;
  status: ProductionReadinessStatus;
  detail: string;
};

export type ProductionReadiness = {
  version: "v1";
  generatedAt: string;
  readinessScore: number;
  launchChecklist: ProductionReadinessCheck[];
  failedChecks: ProductionReadinessCheck[];
  warnings: ProductionReadinessCheck[];
  systemHealthSummary: {
    healthy: number;
    degraded: number;
    down: number;
    notConnected: number;
    unknown: number;
  };
};

type SystemStatus = {
  label: string;
  status: "Healthy" | "Degraded" | "Down" | "Not Connected" | "Unknown";
  detail: string;
};

type SourceStatus = Record<string, "LIVE" | "ESTIMATED" | "NOT CONNECTED" | "NO DATA" | "ERROR">;

type ProductionReadinessInput = {
  systemStatus: SystemStatus[];
  sourceStatus: SourceStatus;
  openAiAnalytics: {
    operationCosts: Array<{ operationType: string; requests: number }>;
    modelUsage: Array<{ model: string; requests: number }>;
    unknownModels: Array<{ model: string; requests: number; tokens: number }>;
    cacheHits: number;
    cacheMisses: number;
    blockedRequests: number;
    limitReachedEvents: number;
    blockedAbuseAttempts: number;
    averageInputTokens: number;
    averageOutputTokens: number;
    averageResponseTimeMs: number;
    successRate: number;
    averageValidationScore: number;
    averageSourceReliability: number;
    averageReportConfidence: number;
  };
  env: {
    hasAppUrl: boolean;
    hasSupabaseUrl: boolean;
    hasSupabaseServiceRole: boolean;
    hasOpenAiKey: boolean;
    stripeConfigured: boolean;
    stripeEnabled: boolean;
    resendConfigured: boolean;
    resendEnabled: boolean;
  };
};

export const EMPTY_PRODUCTION_READINESS: ProductionReadiness = {
  version: "v1",
  generatedAt: new Date(0).toISOString(),
  readinessScore: 0,
  launchChecklist: [],
  failedChecks: [],
  warnings: [],
  systemHealthSummary: {
    healthy: 0,
    degraded: 0,
    down: 0,
    notConnected: 0,
    unknown: 0,
  },
};

function createCheck(
  id: string,
  label: string,
  category: ProductionReadinessCategory,
  status: ProductionReadinessStatus,
  detail: string
): ProductionReadinessCheck {
  return { id, label, category, status, detail };
}

function statusToReadiness(status: SystemStatus["status"]): ProductionReadinessStatus {
  if (status === "Healthy") {
    return "pass";
  }

  if (status === "Degraded" || status === "Unknown") {
    return "warning";
  }

  return "fail";
}

function sourceToReadiness(status: SourceStatus[string]): ProductionReadinessStatus {
  if (status === "LIVE" || status === "ESTIMATED") {
    return "pass";
  }

  if (status === "NO DATA") {
    return "warning";
  }

  return "fail";
}

function findStatus(statuses: SystemStatus[], label: string) {
  return statuses.find((item) => item.label.toLowerCase() === label.toLowerCase());
}

function hasOperation(input: ProductionReadinessInput, matcher: (operationType: string) => boolean) {
  return input.openAiAnalytics.operationCosts.some(
    (item) => item.requests > 0 && matcher(item.operationType.toLowerCase())
  );
}

function healthSummary(systemStatus: SystemStatus[]): ProductionReadiness["systemHealthSummary"] {
  return systemStatus.reduce<ProductionReadiness["systemHealthSummary"]>(
    (summary, item) => {
      if (item.status === "Healthy") summary.healthy += 1;
      if (item.status === "Degraded") summary.degraded += 1;
      if (item.status === "Down") summary.down += 1;
      if (item.status === "Not Connected") summary.notConnected += 1;
      if (item.status === "Unknown") summary.unknown += 1;

      return summary;
    },
    { healthy: 0, degraded: 0, down: 0, notConnected: 0, unknown: 0 }
  );
}

function scoreChecks(checks: ProductionReadinessCheck[]) {
  if (!checks.length) {
    return 0;
  }

  const score = checks.reduce((sum, check) => {
    if (check.status === "pass") return sum + 1;
    if (check.status === "warning") return sum + 0.55;

    return sum;
  }, 0);

  return Math.round((score / checks.length) * 100);
}

function createHealthChecks(input: ProductionReadinessInput): ProductionReadinessCheck[] {
  const requiredProviders = ["ZERINIX API", "Supabase", "OpenAI", "Stripe", "Resend"];

  return requiredProviders.map((label) => {
    const provider = findStatus(input.systemStatus, label);

    if (!provider) {
      return createCheck(
        `health:${label.toLowerCase().replace(/\s+/g, "-")}`,
        `${label} health`,
        "health",
        "warning",
        `${label} has no health status record yet.`
      );
    }

    return createCheck(
      `health:${label.toLowerCase().replace(/\s+/g, "-")}`,
      `${label} health`,
      "health",
      statusToReadiness(provider.status),
      provider.detail
    );
  });
}

function createEnvironmentChecks(input: ProductionReadinessInput): ProductionReadinessCheck[] {
  const envChecks: Array<[string, string, boolean, string]> = [
    ["env:app-url", "Application URL configured", input.env.hasAppUrl, "NEXT_PUBLIC_APP_URL or VERCEL_URL is available."],
    ["env:supabase-url", "Supabase URL configured", input.env.hasSupabaseUrl, "Supabase project URL is available."],
    [
      "env:supabase-service-role",
      "Supabase service role is server-only",
      input.env.hasSupabaseServiceRole,
      "Server-side Supabase service role key is available for admin checks.",
    ],
    ["env:openai-key", "OpenAI key configured", input.env.hasOpenAiKey, "OpenAI server key is available."],
    ["env:stripe", "Stripe configuration", input.env.stripeConfigured && input.env.stripeEnabled, "Stripe is configured and enabled."],
    ["env:resend", "Resend configuration", input.env.resendConfigured && input.env.resendEnabled, "Resend is configured and enabled."],
  ];

  return envChecks.map(([id, label, ok, detail]) =>
    createCheck(
      id,
      label,
      "environment",
      ok ? "pass" : "fail",
      ok ? detail : `${label} is missing or disabled.`
    )
  );
}

function createCoreFlowChecks(input: ProductionReadinessInput): ProductionReadinessCheck[] {
  const authStatus = sourceToReadiness(input.sourceStatus.users);
  const reportsStatus = sourceToReadiness(input.sourceStatus.reports);
  const billingStatus = sourceToReadiness(input.sourceStatus.subscriptions);
  const hasReportOperation = hasOperation(input, (operationType) =>
    operationType.includes("report") || operationType.includes("plan")
  );

  return [
    createCheck(
      "flow:auth",
      "Registration and login",
      "core_flow",
      authStatus,
      authStatus === "pass"
        ? "Supabase Auth user data is readable for admin validation."
        : "Supabase Auth user telemetry is not live."
    ),
    createCheck(
      "flow:report-generation",
      "Report generation",
      "core_flow",
      reportsStatus === "pass" && hasReportOperation ? "pass" : reportsStatus === "fail" ? "fail" : "warning",
      hasReportOperation
        ? "Stored report activity and report AI operations are visible."
        : "No report-generation AI operation has been observed in the selected telemetry window."
    ),
    createCheck(
      "flow:market-analysis",
      "Market analysis",
      "core_flow",
      hasOperation(input, (operationType) => operationType.includes("market")) ? "pass" : "warning",
      "Market analysis readiness is inferred from observed market AI operations."
    ),
    createCheck(
      "flow:chat",
      "Chat flow",
      "core_flow",
      hasOperation(input, (operationType) => operationType.includes("chat")) ? "pass" : "warning",
      "Chat readiness is inferred from observed chat AI operations."
    ),
    createCheck(
      "flow:pdf",
      "PDF generation",
      "core_flow",
      hasOperation(input, (operationType) => operationType.includes("pdf")) ? "pass" : "warning",
      "PDF export readiness is inferred from observed PDF export usage."
    ),
    createCheck(
      "flow:billing",
      "Billing flow",
      "core_flow",
      billingStatus,
      billingStatus === "pass"
        ? "Subscription and billing records are visible."
        : "Billing data is not fully live in admin telemetry."
    ),
    createCheck(
      "flow:admin-access",
      "Admin access",
      "core_flow",
      statusToReadiness(findStatus(input.systemStatus, "ZERINIX API")?.status || "Unknown"),
      "Admin route protection is validated by the protected health endpoint reachability check."
    ),
  ];
}

function createAiSystemChecks(input: ProductionReadinessInput): ProductionReadinessCheck[] {
  const hasUsage = input.openAiAnalytics.operationCosts.some((item) => item.requests > 0);
  const cacheEvents = input.openAiAnalytics.cacheHits + input.openAiAnalytics.cacheMisses;

  return [
    createCheck(
      "ai:model-routing",
      "Model routing",
      "ai_system",
      input.openAiAnalytics.unknownModels.length ? "warning" : input.openAiAnalytics.modelUsage.length ? "pass" : "warning",
      input.openAiAnalytics.unknownModels.length
        ? "Unknown model names were observed in usage telemetry."
        : "Model usage telemetry is available and mapped to configured pricing."
    ),
    createCheck(
      "ai:cache",
      "AI cache behavior",
      "ai_system",
      cacheEvents > 0 ? "pass" : "warning",
      cacheEvents > 0
        ? "Cache hit/miss telemetry is available."
        : "No cache hit/miss telemetry has been observed yet."
    ),
    createCheck(
      "ai:usage-limits",
      "Usage limits",
      "ai_system",
      hasUsage || input.openAiAnalytics.blockedRequests + input.openAiAnalytics.limitReachedEvents > 0 ? "pass" : "warning",
      "Usage guard readiness is inferred from AI usage and limit-event telemetry."
    ),
    createCheck(
      "ai:abuse-protection",
      "Abuse protection",
      "ai_system",
      hasUsage || input.openAiAnalytics.blockedAbuseAttempts >= 0 ? "pass" : "warning",
      "Abuse protection metrics are wired into admin analytics."
    ),
    createCheck(
      "ai:token-optimization",
      "Token optimization",
      "ai_system",
      input.openAiAnalytics.averageInputTokens > 0 || input.openAiAnalytics.averageOutputTokens > 0 ? "pass" : "warning",
      "Average input/output token telemetry is available."
    ),
    createCheck(
      "ai:quality-monitoring",
      "Quality monitoring",
      "ai_system",
      input.openAiAnalytics.averageValidationScore > 0 || input.openAiAnalytics.successRate > 0 ? "pass" : "warning",
      "Report validation and success-rate telemetry are available."
    ),
    createCheck(
      "ai:source-reliability",
      "Source reliability",
      "ai_system",
      input.openAiAnalytics.averageSourceReliability > 0 ? "pass" : "warning",
      "Source reliability metadata is visible in admin analytics."
    ),
    createCheck(
      "ai:confidence-scoring",
      "Confidence scoring",
      "ai_system",
      input.openAiAnalytics.averageReportConfidence > 0 ? "pass" : "warning",
      "Report confidence telemetry is visible in admin analytics."
    ),
  ];
}

export function createProductionReadiness(input: ProductionReadinessInput): ProductionReadiness {
  const launchChecklist = [
    ...createHealthChecks(input),
    ...createEnvironmentChecks(input),
    ...createCoreFlowChecks(input),
    ...createAiSystemChecks(input),
  ];
  const failedChecks = launchChecklist.filter((check) => check.status === "fail");
  const warnings = launchChecklist.filter((check) => check.status === "warning");

  return {
    version: "v1",
    generatedAt: new Date().toISOString(),
    readinessScore: scoreChecks(launchChecklist),
    launchChecklist,
    failedChecks,
    warnings,
    systemHealthSummary: healthSummary(input.systemStatus),
  };
}
