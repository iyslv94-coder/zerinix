import "server-only";

import type { AiRoiIntelligence } from "@/app/lib/ai-roi-intelligence";
import type { ExecutiveDecisionIntelligence } from "@/app/lib/executive-decision-intelligence";
import type { LiveEvidenceMetadata } from "@/app/lib/live-evidence";
import type { ReportConfidenceMetadata } from "@/app/lib/report-confidence";
import type { ReportQualityValidationResult } from "@/app/lib/report-quality-validation";
import type { SourceReliabilitySummary } from "@/app/lib/source-reliability";

export type BusinessImpactCategory =
  | "Informational"
  | "Tactical"
  | "Strategic"
  | "Transformational";

export type AiBusinessImpactIntelligence = {
  business_impact_score: number;
  revenue_potential: number;
  cost_reduction_potential: number;
  time_to_market_improvement: number;
  operational_efficiency_gain: number;
  decision_speed_score: number;
  efficiency_score: number;
  impact_category: BusinessImpactCategory;
  business_impact_version: "v1";
};

type BusinessImpactInput = {
  report: Record<string, string>;
  validation: ReportQualityValidationResult;
  sources: SourceReliabilitySummary;
  confidence: ReportConfidenceMetadata;
  evidence: LiveEvidenceMetadata;
  decision: ExecutiveDecisionIntelligence;
  roi: AiRoiIntelligence;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getReportText(report: Record<string, string>) {
  return Object.values(report).join("\n").toLowerCase();
}

function countMatches(text: string, pattern: RegExp) {
  return (text.match(pattern) || []).length;
}

function classifyImpact(score: number): BusinessImpactCategory {
  if (score >= 85) return "Transformational";
  if (score >= 68) return "Strategic";
  if (score >= 45) return "Tactical";
  return "Informational";
}

export function createAiBusinessImpactIntelligence(
  input: BusinessImpactInput
): AiBusinessImpactIntelligence {
  const text = getReportText(input.report);
  const revenueSignals = countMatches(
    text,
    /\b(?:revenue|gelir|arr|mrr|pricing|fiyat|subscription|abonelik|ltv|arpa|sales|satış|growth|büyüme)\b/g
  );
  const efficiencySignals = countMatches(
    text,
    /\b(?:efficiency|verimlilik|automation|otomasyon|process|süreç|operations|operasyon|cost|maliyet|burn|runway|finansal pist)\b/g
  );
  const marketSignals = countMatches(
    text,
    /\b(?:market|pazar|customer|müşteri|gtm|go-to-market|competitor|rakip|tam|sam|som|segment|channel|kanal)\b/g
  );
  const validationScore = input.validation.validation_score || 0;
  const confidenceBoost =
    input.confidence.overall_confidence === "High"
      ? 10
      : input.confidence.overall_confidence === "Medium"
        ? 4
        : -8;
  const evidenceBoost = Math.min(12, input.evidence.evidence_count * 2);
  const sourceBoost = Math.min(12, input.sources.average_source_score / 8);
  const revenuePotential = clampScore(
    35 +
      Math.min(28, revenueSignals * 3) +
      input.decision.impact_score * 0.25 +
      sourceBoost
  );
  const costReductionPotential = clampScore(
    30 + Math.min(30, efficiencySignals * 4) + input.roi.estimated_hours_saved * 2 + evidenceBoost
  );
  const timeToMarketImprovement = clampScore(
    38 +
      input.decision.urgency_score * 0.25 +
      input.roi.estimated_hours_saved * 2.5 +
      (validationScore >= 70 ? 10 : 0)
  );
  const operationalEfficiencyGain = clampScore(
    34 + Math.min(32, efficiencySignals * 4) + input.roi.roi_score * 0.16 + confidenceBoost
  );
  const decisionSpeedScore = clampScore(
    42 +
      input.decision.decision_score * 0.28 +
      input.roi.roi_score * 0.18 +
      Math.min(14, marketSignals * 1.5) -
      Math.max(0, input.decision.execution_complexity - 70) * 0.25
  );
  const efficiencyScore = clampScore(
    costReductionPotential * 0.45 +
      operationalEfficiencyGain * 0.35 +
      timeToMarketImprovement * 0.2
  );
  const businessImpactScore = clampScore(
    revenuePotential * 0.3 +
      efficiencyScore * 0.25 +
      decisionSpeedScore * 0.25 +
      input.decision.impact_score * 0.15 +
      confidenceBoost * 0.5
  );

  return {
    business_impact_score: businessImpactScore,
    revenue_potential: revenuePotential,
    cost_reduction_potential: costReductionPotential,
    time_to_market_improvement: timeToMarketImprovement,
    operational_efficiency_gain: operationalEfficiencyGain,
    decision_speed_score: decisionSpeedScore,
    efficiency_score: efficiencyScore,
    impact_category: classifyImpact(businessImpactScore),
    business_impact_version: "v1",
  };
}
