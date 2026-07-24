import "server-only";

import type { AiBusinessImpactIntelligence } from "@/app/lib/ai-business-impact-intelligence";
import type { AiOutcomeIntelligence } from "@/app/lib/ai-outcome-intelligence";
import type { AiRoiIntelligence } from "@/app/lib/ai-roi-intelligence";
import type { ExecutiveDecisionIntelligence } from "@/app/lib/executive-decision-intelligence";
import type { LiveEvidenceMetadata } from "@/app/lib/live-evidence";
import type { MarketIntelligence } from "@/app/lib/market-intelligence";
import type { ReportConfidenceMetadata } from "@/app/lib/report-confidence";
import type { ReportQualityValidationResult } from "@/app/lib/report-quality-validation";
import type { SourceReliabilitySummary } from "@/app/lib/source-reliability";

export type FounderAction = {
  action_title: string;
  priority: "high" | "medium" | "low";
  expected_impact: "high" | "medium" | "low";
  difficulty: "high" | "medium" | "low";
  timeline: "0-30 days" | "30-90 days" | "90+ days";
};

export type FounderOperatingSystem = {
  founder_actions: {
    immediate: FounderAction[];
    shortTerm: FounderAction[];
    longTerm: FounderAction[];
  };
  completed_actions: number;
  pending_actions: number;
  overdue_actions: number;
  progress_score: number;
  founder_health_score: number;
  action_completion_rate: number;
  execution_readiness: number;
  strategic_clarity: number;
  market_readiness: number;
  financial_readiness: number;
  founder_blockers: string[];
  founder_os_version: "v1";
};

type FounderOsInput = {
  validation: ReportQualityValidationResult;
  sources: SourceReliabilitySummary;
  evidence: LiveEvidenceMetadata;
  confidence: ReportConfidenceMetadata;
  decision: ExecutiveDecisionIntelligence;
  roi: AiRoiIntelligence;
  businessImpact: AiBusinessImpactIntelligence;
  outcome: AiOutcomeIntelligence;
  market: MarketIntelligence;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function band(score: number): "high" | "medium" | "low" {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function confidenceScore(confidence: ReportConfidenceMetadata["overall_confidence"]) {
  if (confidence === "High") return 82;
  if (confidence === "Medium") return 62;
  return 38;
}

function action(
  actionTitle: string,
  priority: FounderAction["priority"],
  expectedImpact: FounderAction["expected_impact"],
  difficulty: FounderAction["difficulty"],
  timeline: FounderAction["timeline"]
): FounderAction {
  return {
    action_title: actionTitle,
    priority,
    expected_impact: expectedImpact,
    difficulty,
    timeline,
  };
}

function buildBlockers(input: FounderOsInput) {
  const blockers = new Set<string>();

  if (input.market.customer_demand_signals < 55) blockers.add("Customer validation");
  if (input.market.competitive_intensity >= 70) blockers.add("Competitive pressure");
  if (input.outcome.implementation_risk >= 70) blockers.add("Implementation risk");
  if (input.roi.roi_score < 55) blockers.add("ROI realization");
  if (input.sources.average_source_score < 55) blockers.add("Weak evidence");
  if (input.validation.validation_score < 60) blockers.add("Validation gaps");

  return [...blockers];
}

export function createFounderOperatingSystem(input: FounderOsInput): FounderOperatingSystem {
  const reportConfidence = confidenceScore(input.confidence.overall_confidence);
  const executionReadiness = clampScore(
    input.outcome.execution_probability * 0.34 +
      (100 - input.outcome.implementation_risk) * 0.22 +
      input.decision.decision_score * 0.22 +
      input.validation.validation_score * 0.22
  );
  const strategicClarity = clampScore(
    input.decision.decision_score * 0.34 +
      input.businessImpact.decision_speed_score * 0.24 +
      reportConfidence * 0.2 +
      input.market.market_intelligence_score * 0.22
  );
  const marketReadiness = clampScore(
    input.market.market_attractiveness_score * 0.28 +
      input.market.customer_demand_signals * 0.26 +
      input.market.opportunity_score * 0.24 +
      input.sources.average_source_score * 0.22
  );
  const financialReadiness = clampScore(
    input.roi.roi_score * 0.3 +
      input.businessImpact.efficiency_score * 0.25 +
      input.outcome.expected_roi_realization * 0.25 +
      input.evidence.evidence_count * 4
  );
  const founderHealthScore = clampScore(
    executionReadiness * 0.3 +
      strategicClarity * 0.25 +
      marketReadiness * 0.25 +
      financialReadiness * 0.2
  );
  const blockers = buildBlockers(input);
  const immediate = [
    action(
      input.market.customer_demand_signals < 60
        ? "Validate customer demand with focused interviews or paid commitments"
        : "Turn the strongest demand signal into a measurable acquisition test",
      "high",
      "high",
      band(input.outcome.implementation_risk),
      "0-30 days"
    ),
    action(
      input.market.competitive_intensity >= 65
        ? "Map competitor switching barriers and define the first defensible wedge"
        : "Clarify the differentiated wedge and first customer segment",
      "high",
      "medium",
      "medium",
      "0-30 days"
    ),
    action(
      input.roi.roi_score < 60
        ? "Validate the assumptions that determine ROI realization"
        : "Convert report priorities into weekly operating metrics",
      "medium",
      "medium",
      "medium",
      "0-30 days"
    ),
  ];
  const shortTerm = [
    action("Run pricing, acquisition, and retention experiments against decision thresholds", "high", "high", "medium", "30-90 days"),
    action("Build a KPI cadence for acquisition, activation, revenue, and evidence quality", "medium", "medium", "medium", "30-90 days"),
    action("Strengthen source evidence for market, financial, and competitive assumptions", "medium", "medium", "low", "30-90 days"),
  ];
  const longTerm = [
    action("Scale the channel with the strongest validated unit economics", "high", "high", "high", "90+ days"),
    action("Expand into adjacent customer segments only after repeatability is proven", "medium", "high", "medium", "90+ days"),
    action("Prepare investor narrative around validated traction, market wedge, and operating discipline", "medium", "medium", "medium", "90+ days"),
  ];
  const totalActions = immediate.length + shortTerm.length + longTerm.length;

  return {
    founder_actions: {
      immediate,
      shortTerm,
      longTerm,
    },
    completed_actions: 0,
    pending_actions: totalActions,
    overdue_actions: 0,
    progress_score: 0,
    founder_health_score: founderHealthScore,
    action_completion_rate: 0,
    execution_readiness: executionReadiness,
    strategic_clarity: strategicClarity,
    market_readiness: marketReadiness,
    financial_readiness: financialReadiness,
    founder_blockers: blockers,
    founder_os_version: "v1",
  };
}
