import "server-only";

import type { AiBusinessImpactIntelligence } from "@/app/lib/ai-business-impact-intelligence";
import type { AiRoiIntelligence } from "@/app/lib/ai-roi-intelligence";
import type { ExecutiveDecisionIntelligence } from "@/app/lib/executive-decision-intelligence";
import type { LiveEvidenceMetadata } from "@/app/lib/live-evidence";
import type { ReportConfidenceMetadata } from "@/app/lib/report-confidence";
import type { ReportQualityValidationResult } from "@/app/lib/report-quality-validation";
import type { SourceReliabilitySummary } from "@/app/lib/source-reliability";

export type OutcomeProbabilityCategory =
  | "Low Probability"
  | "Moderate Probability"
  | "High Probability"
  | "Very High Probability";

export type AiOutcomeIntelligence = {
  outcome_score: number;
  execution_probability: number;
  expected_business_outcome: number;
  implementation_risk: number;
  expected_roi_realization: number;
  adoption_probability: number;
  outcome_category: OutcomeProbabilityCategory;
  outcome_version: "v1";
};

type OutcomeInput = {
  validation: ReportQualityValidationResult;
  sources: SourceReliabilitySummary;
  confidence: ReportConfidenceMetadata;
  evidence: LiveEvidenceMetadata;
  decision: ExecutiveDecisionIntelligence;
  roi: AiRoiIntelligence;
  businessImpact: AiBusinessImpactIntelligence;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function classifyOutcome(score: number): OutcomeProbabilityCategory {
  if (score >= 85) return "Very High Probability";
  if (score >= 68) return "High Probability";
  if (score >= 45) return "Moderate Probability";
  return "Low Probability";
}

function confidenceScore(confidence: ReportConfidenceMetadata["overall_confidence"]) {
  if (confidence === "High") return 82;
  if (confidence === "Medium") return 62;
  return 38;
}

export function createAiOutcomeIntelligence(input: OutcomeInput): AiOutcomeIntelligence {
  const validationScore = input.validation.validation_score || 0;
  const sourceScore = input.sources.average_source_score || 0;
  const reportConfidenceScore = confidenceScore(input.confidence.overall_confidence);
  const evidenceScore = Math.min(100, input.evidence.evidence_count * 16 + input.evidence.freshness_score * 0.3);
  const executionComplexity = input.decision.execution_complexity || 50;
  const executionProbability = clampScore(
    validationScore * 0.28 +
      sourceScore * 0.18 +
      reportConfidenceScore * 0.2 +
      evidenceScore * 0.14 +
      input.decision.decision_score * 0.2 -
      Math.max(0, executionComplexity - 55) * 0.35
  );
  const adoptionProbability = clampScore(
    input.businessImpact.revenue_potential * 0.28 +
      input.businessImpact.decision_speed_score * 0.24 +
      validationScore * 0.22 +
      evidenceScore * 0.14 +
      reportConfidenceScore * 0.12
  );
  const implementationRisk = clampScore(
    executionComplexity * 0.45 +
      Math.max(0, 100 - validationScore) * 0.25 +
      Math.max(0, 100 - sourceScore) * 0.15 +
      Math.max(0, 100 - evidenceScore) * 0.15
  );
  const expectedRoiRealization = clampScore(
    input.roi.roi_score * 0.34 +
      executionProbability * 0.28 +
      adoptionProbability * 0.2 +
      input.businessImpact.efficiency_score * 0.18
  );
  const expectedBusinessOutcome = clampScore(
    input.businessImpact.business_impact_score * 0.36 +
      executionProbability * 0.26 +
      adoptionProbability * 0.22 +
      expectedRoiRealization * 0.16
  );
  const outcomeScore = clampScore(
    expectedBusinessOutcome * 0.34 +
      executionProbability * 0.26 +
      adoptionProbability * 0.22 +
      expectedRoiRealization * 0.18 -
      Math.max(0, implementationRisk - 70) * 0.25
  );

  return {
    outcome_score: outcomeScore,
    execution_probability: executionProbability,
    expected_business_outcome: expectedBusinessOutcome,
    implementation_risk: implementationRisk,
    expected_roi_realization: expectedRoiRealization,
    adoption_probability: adoptionProbability,
    outcome_category: classifyOutcome(outcomeScore),
    outcome_version: "v1",
  };
}
