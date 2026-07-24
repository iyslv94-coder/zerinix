import "server-only";

type CostRisk = "low" | "medium" | "high";
type CostTrend = "falling" | "flat" | "rising";

export type PredictiveCostIntelligence = {
  hourlyCost: number;
  dailyCost: number;
  weeklyCost: number;
  monthlyCost: number;
  forecastToday: number;
  forecastWeek: number;
  forecastMonth: number;
  currentBurnRate: number;
  projectedBurnRate: number;
  projectedMonthlySpend: number;
  estimatedRemainingFreeCredits: number | null;
  costRisk: CostRisk;
  costTrend: CostTrend;
  projected_cost: number;
  burn_rate: number;
  forecast_accuracy: number;
  anomaly_score: number;
};

type UsageRecord = Record<string, unknown>;

const EMPTY_FORECAST: PredictiveCostIntelligence = {
  hourlyCost: 0,
  dailyCost: 0,
  weeklyCost: 0,
  monthlyCost: 0,
  forecastToday: 0,
  forecastWeek: 0,
  forecastMonth: 0,
  currentBurnRate: 0,
  projectedBurnRate: 0,
  projectedMonthlySpend: 0,
  estimatedRemainingFreeCredits: null,
  costRisk: "low",
  costTrend: "flat",
  projected_cost: 0,
  burn_rate: 0,
  forecast_accuracy: 0,
  anomaly_score: 0,
};

function readNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function readDate(value: unknown) {
  if (typeof value !== "string" || !value) return null;

  const parsed = new Date(value);

  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function roundUsd(value: number) {
  return Number(Math.max(0, value).toFixed(4));
}

function getCost(row: UsageRecord) {
  const metadata = row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
    ? (row.metadata as Record<string, unknown>)
    : {};

  return (
    readNumber(row.estimated_cost_usd) ||
    readNumber(metadata.estimatedCostUsd) ||
    readNumber(metadata.estimated_cost_usd) ||
    0
  );
}

function getConfiguredFreeCredits() {
  const raw = process.env.AI_COST_CONFIG;

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const value =
      readNumber(parsed.freeCreditsUsd) ||
      readNumber(parsed.free_credits_usd) ||
      readNumber(parsed.monthlyFreeCreditsUsd);

    return value > 0 ? value : null;
  } catch {
    return null;
  }
}

function sumCost(rows: UsageRecord[]) {
  return rows.reduce((sum, row) => sum + getCost(row), 0);
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function createPredictiveCostIntelligence(
  usageRows: UsageRecord[],
  now = new Date()
): PredictiveCostIntelligence {
  const datedRows = usageRows
    .map((row) => ({ row, createdAt: readDate(row.created_at), cost: getCost(row) }))
    .filter((item): item is { row: UsageRecord; createdAt: Date; cost: number } =>
      Boolean(item.createdAt && item.cost > 0)
    )
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  if (!datedRows.length) {
    return EMPTY_FORECAST;
  }

  const nowMs = now.getTime();
  const totalCost = datedRows.reduce((sum, item) => sum + item.cost, 0);
  const firstUsageAt = datedRows[0]?.createdAt.getTime() || nowMs;
  const observedHours = Math.max(1, (nowMs - firstUsageAt) / 3_600_000);
  const hourlyCost = totalCost / observedHours;
  const last24hRows = datedRows.filter((item) => nowMs - item.createdAt.getTime() <= 86_400_000);
  const last7dRows = datedRows.filter((item) => nowMs - item.createdAt.getTime() <= 604_800_000);
  const currentBurnRate = sumCost(last24hRows.map((item) => item.row)) / 24;
  const baselineBurnRate = last7dRows.length
    ? sumCost(last7dRows.map((item) => item.row)) / (Math.min(168, observedHours) || 1)
    : hourlyCost;
  const projectedBurnRate = currentBurnRate > 0
    ? currentBurnRate * 0.65 + baselineBurnRate * 0.35
    : baselineBurnRate;
  const todayStart = startOfDay(now).getTime();
  const monthStart = startOfMonth(now).getTime();
  const costToday = datedRows
    .filter((item) => item.createdAt.getTime() >= todayStart)
    .reduce((sum, item) => sum + item.cost, 0);
  const costMonth = datedRows
    .filter((item) => item.createdAt.getTime() >= monthStart)
    .reduce((sum, item) => sum + item.cost, 0);
  const hoursIntoDay = Math.max(1, (nowMs - todayStart) / 3_600_000);
  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  const hoursRemainingToday = Math.max(0, 24 - hoursIntoDay);
  const hoursRemainingMonth = Math.max(0, daysInMonth * 24 - (nowMs - monthStart) / 3_600_000);
  const forecastToday = costToday + projectedBurnRate * hoursRemainingToday;
  const forecastMonth = costMonth + projectedBurnRate * hoursRemainingMonth;
  const projectedMonthlySpend = projectedBurnRate * 24 * 30;
  const anomalyRatio = baselineBurnRate > 0 ? Math.max(0, currentBurnRate / baselineBurnRate - 1) : 0;
  const anomalyScore = Math.min(100, Math.round(anomalyRatio * 100));
  const trendRatio = baselineBurnRate > 0 ? (currentBurnRate - baselineBurnRate) / baselineBurnRate : 0;
  const costTrend: CostTrend = trendRatio > 0.15 ? "rising" : trendRatio < -0.15 ? "falling" : "flat";
  const costRisk: CostRisk =
    anomalyScore >= 65 || projectedMonthlySpend >= Math.max(25, totalCost * 3)
      ? "high"
      : anomalyScore >= 30 || costTrend === "rising"
        ? "medium"
        : "low";
  const freeCredits = getConfiguredFreeCredits();
  const estimatedRemainingFreeCredits =
    freeCredits === null ? null : roundUsd(Math.max(0, freeCredits - forecastMonth));
  const forecastAccuracy = Math.max(
    35,
    Math.min(92, Math.round(55 + Math.min(25, datedRows.length) + Math.min(12, observedHours / 24) - anomalyScore * 0.2))
  );

  return {
    hourlyCost: roundUsd(hourlyCost),
    dailyCost: roundUsd(hourlyCost * 24),
    weeklyCost: roundUsd(hourlyCost * 24 * 7),
    monthlyCost: roundUsd(hourlyCost * 24 * 30),
    forecastToday: roundUsd(forecastToday),
    forecastWeek: roundUsd(projectedBurnRate * 24 * 7),
    forecastMonth: roundUsd(forecastMonth),
    currentBurnRate: roundUsd(currentBurnRate),
    projectedBurnRate: roundUsd(projectedBurnRate),
    projectedMonthlySpend: roundUsd(projectedMonthlySpend),
    estimatedRemainingFreeCredits,
    costRisk,
    costTrend,
    projected_cost: roundUsd(forecastMonth),
    burn_rate: roundUsd(projectedBurnRate),
    forecast_accuracy: forecastAccuracy,
    anomaly_score: anomalyScore,
  };
}
