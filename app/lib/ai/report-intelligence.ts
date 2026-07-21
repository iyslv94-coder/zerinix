import type { FinancialConsistencyCheck, FinancialModel } from "@/app/lib/ai/financial-model";
import type { InvestmentScore } from "@/app/lib/ai/investment-score";

export type ReportQualityLevel = "High Confidence" | "Moderate Confidence" | "Low Confidence";

export type ReportIntelligenceModel = {
  version: "report_intelligence_engine_v1";
  overallQuality: ReportQualityLevel;
  qualityScore: number;
  dimensions: {
    financialConsistency: number;
    evidenceStrength: number;
    marketValidation: number;
    businessModelQuality: number;
    executionReadiness: number;
    decisionReliability: number;
  };
  strengths: string[];
  risks: string[];
  warnings: string[];
  confidenceSummary: string;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function categoryScore(
  context: ReportIntelligenceInput,
  key: keyof InvestmentScore["categories"]
) {
  const category = context.investmentScore.categories[key];

  return Math.round((category.score / Math.max(1, category.maximumScore)) * 100);
}

function qualityFromScore(score: number): ReportQualityLevel {
  if (score >= 72) {
    return "High Confidence";
  }

  if (score >= 48) {
    return "Moderate Confidence";
  }

  return "Low Confidence";
}

type ReportIntelligenceInput = FinancialModel & {
  investmentScore: InvestmentScore;
  financialConsistency: FinancialConsistencyCheck;
  decisionConfidence: {
    confidenceScore: number;
    decision: "GO" | "WAIT" | "NO-GO";
    positiveFactors: string[];
    negativeFactors: string[];
  };
};

export function createReportIntelligenceModel(context: ReportIntelligenceInput): ReportIntelligenceModel {
  const financialConsistency =
    context.financialConsistency.quality === "Healthy"
      ? 86
      : context.financialConsistency.quality === "Needs Validation"
        ? 58
        : 34;
  const evidenceStrength = clampScore(
    (context.investmentScore.confidence * 0.65) +
      (context.decisionConfidence.confidenceScore * 0.35)
  );
  const marketValidation = categoryScore(context, "marketOpportunity");
  const businessModelQuality = categoryScore(context, "businessModel");
  const executionReadiness = categoryScore(context, "executionRisk");
  const decisionReliability = context.decisionConfidence.confidenceScore;
  const qualityScore = clampScore(
    (financialConsistency * 0.2) +
      (evidenceStrength * 0.18) +
      (marketValidation * 0.16) +
      (businessModelQuality * 0.16) +
      (executionReadiness * 0.14) +
      (decisionReliability * 0.16)
  );
  const aggressiveDecision =
    context.decisionConfidence.decision === "GO" ||
    context.investmentScore.recommendation === "GO";
  const unresolvedRisks =
    context.financialConsistency.quality !== "Healthy" ||
    context.decisionConfidence.negativeFactors.length >= 2 ||
    context.investmentScore.topRisks.length >= 2;
  const warnings = [
    aggressiveDecision && unresolvedRisks
      ? "Decision vs Risk: aggressive recommendation conflicts with unresolved risk signals."
      : "",
    context.financialConsistency.warnings.some((warning) => warning.code === "capital_efficiency") &&
    context.investmentScore.confidence < 60
      ? "Financial vs Recommendation: high funding need and weak validation require caution."
      : "",
    context.investmentScore.confidence < 50 && aggressiveDecision
      ? "Score vs Decision: low confidence does not support an aggressive recommendation."
      : "",
  ].filter(Boolean);
  const strengths = [
    businessModelQuality >= 58 ? "Clear business model" : "",
    context.metrics.grossMargin.value >= context.benchmark.ranges.grossMargin.low
      ? "Attractive margin potential"
      : "",
    marketValidation >= 58 ? "Meaningful market opportunity" : "",
    context.decisionConfidence.positiveFactors[0] || "",
  ].filter(Boolean);
  const risks = [
    evidenceStrength < 65 ? "Limited customer validation" : "",
    context.financialConsistency.quality !== "Healthy"
      ? "Financial assumptions require testing"
      : "",
    executionReadiness < 55 ? "Execution readiness needs stronger proof" : "",
    context.decisionConfidence.negativeFactors[0] || "",
  ].filter(Boolean);
  const overallQuality = qualityFromScore(qualityScore);

  return {
    version: "report_intelligence_engine_v1",
    overallQuality,
    qualityScore,
    dimensions: {
      financialConsistency,
      evidenceStrength,
      marketValidation,
      businessModelQuality,
      executionReadiness,
      decisionReliability,
    },
    strengths: [...new Set(strengths)].slice(0, 4),
    risks: [...new Set(risks)].slice(0, 4),
    warnings,
    confidenceSummary:
      overallQuality === "High Confidence"
        ? "Report findings are directionally reliable, with limited consistency issues."
        : overallQuality === "Moderate Confidence"
          ? "Report findings are useful for decision planning, but validation gaps remain."
          : "Report findings should be treated as early-stage planning input until evidence improves.",
  };
}
