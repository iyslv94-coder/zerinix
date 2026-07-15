import {
  AlertTriangle,
  Activity,
  BarChart3,
  BrainCircuit,
  CalendarRange,
  FileText,
  ShieldAlert,
  Users,
} from "lucide-react";
import { AdminDateRangeControls } from "../AdminDateRangeControls";
import { AdminShell } from "../AdminShell";
import {
  loadAdminDashboardData,
  loadAdminReports,
  loadAdminUsageQuotas,
  resolveAdminDateRange,
  type AdminMetricStatus,
} from "../admin-data";
import { dashboardTheme } from "@/app/lib/ui/dashboard-theme";

type ExecutiveAlertSeverity = "INFO" | "WARNING" | "CRITICAL";

type ExecutiveInsight = {
  label: string;
  value: string;
  detail: string;
  status: AdminMetricStatus | "INFO";
};

type ExecutiveAlert = {
  id: string;
  severity: ExecutiveAlertSeverity;
  title: string;
  detail: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) {
    return "NO DATA";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatPercentChange(value: number) {
  const sign = value > 0 ? "+" : "";

  return `${sign}${value.toFixed(1)}%`;
}

function seriesPercentChange(series: Array<{ value: number }>) {
  const current = series.at(-1)?.value;
  const previous = series.at(-2)?.value;

  if (current === undefined || previous === undefined || previous <= 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function StatusPill({ status }: { status: AdminMetricStatus | "INFO" }) {
  const tone =
    status === "LIVE"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
      : status === "NOT CONNECTED"
        ? "border-amber-300/20 bg-amber-950/25 text-amber-100"
        : status === "NO DATA"
          ? "border-zinc-500/20 bg-zinc-500/10 text-zinc-300"
          : "border-blue-300/20 bg-blue-300/10 text-blue-100";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${tone}`}>
      {status}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  status = "LIVE",
}: {
  label: string;
  value: string;
  detail: string;
  status?: AdminMetricStatus | "INFO";
}) {
  return (
    <section className={`rounded-[1.5rem] p-5 ${dashboardTheme.surface}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</p>
        <StatusPill status={status} />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">{detail}</p>
    </section>
  );
}

function InsightCard({ insight }: { insight: ExecutiveInsight }) {
  return (
    <div className={`rounded-[1rem] p-4 ${dashboardTheme.innerSurface}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{insight.label}</p>
        <StatusPill status={insight.status} />
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-white">{insight.value}</p>
      <p className="mt-1 text-sm leading-6 text-zinc-500">{insight.detail}</p>
    </div>
  );
}

function InsightSection({
  title,
  description,
  insights,
}: {
  title: string;
  description: string;
  insights: ExecutiveInsight[];
}) {
  return (
    <section className={`rounded-[1.5rem] p-5 ${dashboardTheme.surface}`}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {insights.map((insight) => (
          <InsightCard key={insight.label} insight={insight} />
        ))}
      </div>
    </section>
  );
}

function EmptyState({ children }: { children: string }) {
  return (
    <div className={`rounded-[1rem] p-4 text-sm leading-6 text-zinc-500 ${dashboardTheme.innerSurface}`}>
      {children}
    </div>
  );
}

export default async function AdminAiCeoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const dateRange = resolveAdminDateRange({
    range: params.range,
    from: params.from,
    to: params.to,
  });
  const [dashboard, reports, usage] = await Promise.all([
    loadAdminDashboardData({ range: dateRange }),
    loadAdminReports({ dateRange }),
    loadAdminUsageQuotas({ dateRange }),
  ]);
  const recentReports = reports.reports.slice(0, 5);
  const mostExpensiveUser = usage.topUsers.find((user) => user.aiCostUsd > 0);
  const mostExpensiveReport = usage.topReports.find((report) => report.aiCostUsd > 0);
  const disconnectedServices = dashboard.systemStatus.filter((service) => service.status === "Not Connected");
  const mostActiveUser = usage.topUsers.slice().sort((a, b) => b.totalRequests - a.totalRequests)[0];
  const costTrend = seriesPercentChange(dashboard.charts.estimatedAiCost);
  const reportActivityTrend = seriesPercentChange(dashboard.charts.reportsGenerated);
  const costWarnings = dashboard.openAiAnalytics.costAlerts.filter(
    (item) =>
      item.status === "configured" &&
      item.thresholdUsd !== null &&
      item.currentUsd !== null &&
      item.currentUsd > item.thresholdUsd
  );
  const costInsights: ExecutiveInsight[] = [
    {
      label: "Average report cost",
      value: usage.averageCostPerReport > 0 ? formatCurrency(usage.averageCostPerReport) : "NO DATA",
      detail: usage.averageCostPerReport > 0
        ? "Calculated from attributed AI usage events."
        : "No attributed report cost records were found.",
      status: usage.averageCostPerReport > 0 ? dashboard.sourceStatus.aiUsage : "NO DATA",
    },
    {
      label: "Highest cost report",
      value: mostExpensiveReport ? formatCurrency(mostExpensiveReport.aiCostUsd) : "NO DATA",
      detail: mostExpensiveReport ? mostExpensiveReport.label : "No attributed report cost is available.",
      status: mostExpensiveReport ? "LIVE" : "NO DATA",
    },
    {
      label: "Cost trend",
      value: costTrend !== null ? formatPercentChange(costTrend) : "NO DATA",
      detail: costTrend !== null
        ? "Compared with the previous chart interval."
        : "Cost comparison requires at least two non-zero intervals.",
      status: costTrend !== null ? "LIVE" : "NO DATA",
    },
  ];
  const usageInsights: ExecutiveInsight[] = [
    {
      label: "Reports generated",
      value: formatNumber(dashboard.reportsGenerated),
      detail: "Reports created in the selected range.",
      status: dashboard.sourceStatus.reports,
    },
    {
      label: "AI requests",
      value: formatNumber(dashboard.usageSummary.totalRequests),
      detail: "Stored AI usage events in the selected range.",
      status: dashboard.sourceStatus.aiUsage,
    },
    {
      label: "Average tokens per report",
      value: usage.averageTokensPerReport > 0 ? formatNumber(Math.round(usage.averageTokensPerReport)) : "NO DATA",
      detail: usage.averageTokensPerReport > 0
        ? "Calculated from attributed usage events."
        : "No attributed token records were found.",
      status: usage.averageTokensPerReport > 0 ? dashboard.sourceStatus.aiUsage : "NO DATA",
    },
    {
      label: "Most active user",
      value: mostActiveUser && mostActiveUser.totalRequests > 0 ? mostActiveUser.label : "NO DATA",
      detail: mostActiveUser && mostActiveUser.totalRequests > 0
        ? `${formatNumber(mostActiveUser.totalRequests)} AI requests in the selected range.`
        : "No user-level AI request activity is available.",
      status: mostActiveUser && mostActiveUser.totalRequests > 0 ? "LIVE" : "NO DATA",
    },
  ];
  const reliabilityInsights: ExecutiveInsight[] = [
    {
      label: "Failed AI requests",
      value: formatNumber(dashboard.usageSummary.failedRequests),
      detail: dashboard.usageSummary.failedRequests > 0
        ? "Failures were recorded in stored AI usage events."
        : "No failed AI requests were recorded in the selected range.",
      status: dashboard.sourceStatus.aiUsage,
    },
    {
      label: "Missing integrations",
      value: formatNumber(disconnectedServices.length),
      detail: disconnectedServices.length
        ? disconnectedServices.map((service) => service.label).join(", ")
        : "All monitored services have a connected or checked status.",
      status: disconnectedServices.length ? "NOT CONNECTED" : "LIVE",
    },
    {
      label: "Services not connected",
      value: disconnectedServices.length ? disconnectedServices.map((service) => service.label).join(", ") : "None",
      detail: disconnectedServices.length
        ? "These services are explicitly marked Not Connected by system health."
        : "No monitored service is currently marked Not Connected.",
      status: disconnectedServices.length ? "NOT CONNECTED" : "LIVE",
    },
  ];
  const growthInsights: ExecutiveInsight[] = [
    {
      label: "Registered users",
      value: formatNumber(dashboard.totalUsers),
      detail: "Total users from Supabase Auth.",
      status: dashboard.sourceStatus.users,
    },
    {
      label: "New reports",
      value: formatNumber(dashboard.reportsGenerated),
      detail: "Report records created in the selected range.",
      status: dashboard.sourceStatus.reports,
    },
    {
      label: "Activity trend",
      value: reportActivityTrend !== null ? formatPercentChange(reportActivityTrend) : "NO DATA",
      detail: reportActivityTrend !== null
        ? "Report activity compared with the previous chart interval."
        : "Activity comparison requires at least two non-zero intervals.",
      status: reportActivityTrend !== null ? "LIVE" : "NO DATA",
    },
  ];
  const executiveAlerts: ExecutiveAlert[] = [
    ...costWarnings.map((item) => ({
      id: item.id,
      severity: "WARNING" as const,
      title: `${item.label} exceeded`,
      detail: `${formatCurrency(item.currentUsd || 0)} used against a ${formatCurrency(item.thresholdUsd || 0)} threshold.`,
    })),
    ...(costTrend !== null && costTrend >= 25
      ? [
          {
            id: "cost-trend-increase",
            severity: "WARNING" as const,
            title: "AI cost increased significantly",
            detail: `AI cost increased ${formatPercentChange(costTrend)} versus the previous chart interval.`,
          },
        ]
      : []),
    ...(dashboard.usageSummary.failedRequests > 0
      ? [
          {
            id: "failed-ai-requests",
            severity: "CRITICAL" as const,
            title: "Failed AI requests",
            detail: `${formatNumber(dashboard.usageSummary.failedRequests)} failed AI requests were recorded in ${dashboard.dateRange.label}.`,
          },
        ]
      : dashboard.usageSummary.totalRequests > 0
        ? [
            {
              id: "no-failed-ai-requests",
              severity: "INFO" as const,
              title: "No failed AI requests",
              detail: `No failed AI requests were recorded across ${formatNumber(dashboard.usageSummary.totalRequests)} stored requests.`,
            },
          ]
        : []),
    ...disconnectedServices.map((service) => ({
      id: `service:${service.label}`,
      severity: "WARNING" as const,
      title: `${service.label} not connected`,
      detail: service.detail,
    })),
    ...(dashboard.sourceStatus.aiUsage === "LIVE" && dashboard.usageSummary.totalRequests > 0 && dashboard.usageSummary.failedRequests === 0
      ? [
          {
            id: "openai-usage-normal",
            severity: "INFO" as const,
            title: "OpenAI usage normal",
            detail: `AI usage is present and no failed AI requests were recorded in ${dashboard.dateRange.label}.`,
          },
        ]
      : []),
    ...(dashboard.reportsGenerated >= 10
      ? [
          {
            id: "high-report-activity",
            severity: "INFO" as const,
            title: "High report activity detected",
            detail: `${formatNumber(dashboard.reportsGenerated)} reports were generated in ${dashboard.dateRange.label}.`,
          },
        ]
      : []),
    ...(dashboard.reportsGenerated === 0
      ? [
          {
            id: "no-reports-generated",
            severity: "INFO" as const,
            title: "No reports generated",
            detail: `No reports were generated in ${dashboard.dateRange.label}.`,
          },
        ]
      : []),
    ...(dashboard.reportsGenerated === 0 && dashboard.usageSummary.totalRequests === 0
      ? [
          {
            id: "low-platform-activity",
            severity: "WARNING" as const,
            title: "Low platform activity",
            detail: `No reports or AI requests were recorded in ${dashboard.dateRange.label}.`,
          },
        ]
      : []),
    ...(dashboard.usageSummary.totalRequests === 0
      ? [
          {
            id: "no-usage-data",
            severity: "INFO" as const,
            title: "No AI usage data",
            detail: `No AI usage records were found for ${dashboard.dateRange.label}.`,
          },
        ]
      : []),
  ].slice(0, 8);

  return (
    <AdminShell
      eyebrow="Admin / AI CEO"
      title="AI CEO"
      subtitle="Read-only executive intelligence generated from existing admin data. No AI calls are made."
      headerActions={
        <AdminDateRangeControls
          activeRange={dashboard.dateRange.key}
          fromIso={dashboard.dateRange.fromIso}
          toIso={dashboard.dateRange.toIso}
          variant="inline"
        />
      }
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Registered users"
            value={formatNumber(dashboard.totalUsers)}
            detail="Supabase Auth registered users."
            status={dashboard.sourceStatus.users}
          />
          <MetricCard
            label="Reports"
            value={formatNumber(dashboard.reportsGenerated)}
            detail="Reports created in the selected range."
            status={dashboard.sourceStatus.reports}
          />
          <MetricCard
            label="AI requests"
            value={formatNumber(dashboard.usageSummary.totalRequests)}
            detail="Stored AI usage events in the selected range."
            status={dashboard.sourceStatus.aiUsage}
          />
          <MetricCard
            label="AI cost"
            value={formatCurrency(dashboard.aiApiCost)}
            detail="Stored or centrally estimated AI cost."
            status={dashboard.sourceStatus.aiUsage}
          />
          <MetricCard
            label="Date range"
            value={dashboard.dateRange.label}
            detail="Current executive context window."
            status="INFO"
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className={`rounded-[1.5rem] p-5 ${dashboardTheme.surface}`}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-300/10">
                <BrainCircuit className="h-5 w-5 text-purple-200" />
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-white">Current Signals</h2>
                <p className="text-sm text-zinc-500">Reliable operational signals from existing data.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <div className={`rounded-[1rem] p-4 ${dashboardTheme.innerSurface}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Most expensive user</p>
                {mostExpensiveUser ? (
                  <p className="mt-2 text-sm text-zinc-300">
                    <span className="font-semibold text-white">{mostExpensiveUser.label}</span> · {formatCurrency(mostExpensiveUser.aiCostUsd)}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-zinc-500">NO DATA</p>
                )}
              </div>
              <div className={`rounded-[1rem] p-4 ${dashboardTheme.innerSurface}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Most expensive report</p>
                {mostExpensiveReport ? (
                  <p className="mt-2 text-sm text-zinc-300">
                    <span className="font-semibold text-white">{mostExpensiveReport.label}</span> · {formatCurrency(mostExpensiveReport.aiCostUsd)}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-zinc-500">NO DATA</p>
                )}
              </div>
              <div className={`grid gap-3 rounded-[1rem] p-4 sm:grid-cols-2 ${dashboardTheme.innerSurface}`}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Failed AI requests</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(dashboard.usageSummary.failedRequests)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Services not connected</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(disconnectedServices.length)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-[1.5rem] p-5 ${dashboardTheme.surface}`}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-300/20 bg-blue-300/10">
                <FileText className="h-5 w-5 text-blue-200" />
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-white">Recent Activity</h2>
                <p className="text-sm text-zinc-500">Latest reports in the selected range.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {recentReports.length ? (
                recentReports.map((report) => (
                  <div key={report.id} className={`rounded-[1rem] p-4 ${dashboardTheme.innerSurface}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{report.title}</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {report.ownerEmail} · {report.reportType} · {formatDate(report.createdAt)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-white">{formatCurrency(report.aiCostUsd)}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-600">{report.status}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState>No reports were found for the selected range.</EmptyState>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <InsightSection
            title="Cost"
            description="Cost signals calculated only when stored usage or attribution exists."
            insights={costInsights}
          />
          <InsightSection
            title="Usage"
            description="Platform activity from reports and AI usage records."
            insights={usageInsights}
          />
          <InsightSection
            title="Reliability"
            description="Failure and integration status from stored telemetry and health checks."
            insights={reliabilityInsights}
          />
          <InsightSection
            title="Growth"
            description="User and report activity from existing admin aggregates."
            insights={growthInsights}
          />
        </section>

        <section className={`rounded-[1.5rem] p-5 ${dashboardTheme.surface}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10">
              <ShieldAlert className="h-5 w-5 text-amber-200" />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">CEO Attention Items</h2>
              <p className="text-sm text-zinc-500">Deterministic notices from the current admin context.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {executiveAlerts.length ? (
              executiveAlerts.map((item) => {
                const icon =
                  item.severity === "CRITICAL" ? AlertTriangle : item.severity === "WARNING" ? ShieldAlert : Activity;
                const Icon = icon;
                const tone =
                  item.severity === "CRITICAL"
                    ? "border-red-300/20 bg-red-950/20 text-red-100"
                    : item.severity === "WARNING"
                      ? "border-amber-300/20 bg-amber-950/20 text-amber-100"
                      : "border-blue-300/20 bg-blue-950/20 text-blue-100";

                return (
                  <div key={item.id} className={`rounded-[1rem] border p-4 ${tone}`}>
                    <div className="flex gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{item.severity}</p>
                        <p className="mt-1 text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-zinc-400">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState>No CEO attention items were generated from the selected range.</EmptyState>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className={`rounded-[1.5rem] p-5 ${dashboardTheme.surface}`}>
            <Users className="h-5 w-5 text-emerald-200" />
            <p className="mt-4 text-sm font-semibold text-white">User context</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              User totals come from the existing Supabase Auth admin source.
            </p>
          </div>
          <div className={`rounded-[1.5rem] p-5 ${dashboardTheme.surface}`}>
            <BarChart3 className="h-5 w-5 text-purple-200" />
            <p className="mt-4 text-sm font-semibold text-white">Cost context</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Cost signals reuse stored AI usage events and existing attribution.
            </p>
          </div>
          <div className={`rounded-[1.5rem] p-5 ${dashboardTheme.surface}`}>
            <CalendarRange className="h-5 w-5 text-blue-200" />
            <p className="mt-4 text-sm font-semibold text-white">Range context</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Snapshot, signals and report activity respect the selected date range.
            </p>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
