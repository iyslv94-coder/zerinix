import "server-only";

import type { AiFinancialModelContext } from "@/app/lib/ai/financial-assumptions";
import type { ExecutiveDecisionIntelligence } from "@/app/lib/executive-decision-intelligence";
import type { LiveEvidenceMetadata } from "@/app/lib/live-evidence";
import type { ReportConfidenceMetadata } from "@/app/lib/report-confidence";
import type { SourceReliabilitySummary } from "@/app/lib/source-reliability";

export type MarketRiskLevel = "low" | "medium" | "high";
export type MarketOpportunityLevel = "low" | "medium" | "high";
export type CompetitivePressure = "low" | "medium" | "high";

export type MarketIntelligence = {
  market_intelligence_score: number;
  market_size_indicators: number;
  growth_indicators: number;
  competitive_intensity: number;
  customer_demand_signals: number;
  industry_maturity: number;
  market_opportunity_score: number;
  competitor_density: number;
  differentiation_opportunity: number;
  market_gaps: number;
  entry_difficulty: number;
  market_attractiveness_score: number;
  competition_score: number;
  opportunity_score: number;
  maturity_score: number;
  market_risk_level: MarketRiskLevel;
  opportunity_level: MarketOpportunityLevel;
  competitive_pressure: CompetitivePressure;
  market_industry: string;
  market_business_model: string;
  market_intelligence_version: "v2";
};

type MarketIntelligenceInput = {
  report: Record<string, string>;
  context?: AiFinancialModelContext;
  sources: SourceReliabilitySummary;
  evidence: LiveEvidenceMetadata;
  confidence: ReportConfidenceMetadata;
  decision: ExecutiveDecisionIntelligence;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getText(report: Record<string, string>) {
  return Object.values(report).join("\n").toLowerCase();
}

function countMatches(text: string, pattern: RegExp) {
  return (text.match(pattern) || []).length;
}

function levelFromScore(score: number): MarketOpportunityLevel {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function riskFromScore(score: number): MarketRiskLevel {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function pressureFromScore(score: number): CompetitivePressure {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function confidenceScore(confidence: ReportConfidenceMetadata["overall_confidence"]) {
  if (confidence === "High") return 82;
  if (confidence === "Medium") return 62;
  return 38;
}

export function createMarketIntelligence(input: MarketIntelligenceInput): MarketIntelligence {
  const text = getText(input.report);
  const marketSignals = countMatches(text, /\b(?:tam|sam|som|market|pazar|segment|category|kategori|demand|talep|customer|müşteri)\b/g);
  const growthSignals = countMatches(text, /\b(?:growth|büyüme|trend|tailwind|momentum|adoption|benimseme|expansion|genişleme|scale|ölçek)\b/g);
  const competitionSignals = countMatches(text, /\b(?:competitor|competition|competitive|rakip|rekabet|incumbent|substitute|ikame|rivalry|rivalite)\b/g);
  const demandSignals = countMatches(text, /\b(?:pain|problem|purchase|intent|willingness|interview|pilot|traction|talep|acı|satın|ödeme|validat|doğrula)\b/g);
  const sourceScore = input.sources.average_source_score || 0;
  const evidenceScore = Math.min(100, input.evidence.evidence_count * 16 + input.evidence.freshness_score * 0.3);
  const reportConfidence = confidenceScore(input.confidence.overall_confidence);
  const marketSizeIndicators = clampScore(35 + Math.min(30, marketSignals * 3) + sourceScore * 0.2);
  const growthIndicators = clampScore(32 + Math.min(34, growthSignals * 4) + reportConfidence * 0.18);
  const competitiveIntensity = clampScore(30 + Math.min(44, competitionSignals * 5) + (sourceScore < 55 ? 8 : 0));
  const customerDemandSignals = clampScore(28 + Math.min(38, demandSignals * 4) + evidenceScore * 0.24);
  const industryMaturity = clampScore(
    45 +
      Math.min(22, marketSignals * 1.4) +
      Math.min(18, competitionSignals * 1.6) +
      sourceScore * 0.12
  );
  const competitorDensity = competitiveIntensity;
  const differentiationOpportunity = clampScore(
    70 - competitiveIntensity * 0.3 + input.decision.impact_score * 0.25 + growthIndicators * 0.15
  );
  const marketGaps = clampScore(
    38 + Math.min(30, countMatches(text, /\b(?:gap|white space|underserved|unmet|boşluk|karşılanmayan|fırsat)\b/g) * 6) + differentiationOpportunity * 0.2
  );
  const entryDifficulty = clampScore(
    32 + competitiveIntensity * 0.38 + Math.max(0, input.decision.execution_complexity - 45) * 0.35
  );
  const marketAttractivenessScore = clampScore(
    marketSizeIndicators * 0.28 +
      growthIndicators * 0.24 +
      customerDemandSignals * 0.2 +
      differentiationOpportunity * 0.18 +
      sourceScore * 0.1
  );
  const competitionScore = clampScore(100 - competitiveIntensity * 0.65 + differentiationOpportunity * 0.35);
  const opportunityScore = clampScore(
    marketAttractivenessScore * 0.45 +
      marketGaps * 0.25 +
      input.decision.impact_score * 0.2 +
      reportConfidence * 0.1
  );
  const maturityScore = industryMaturity;
  const marketOpportunityScore = clampScore(
    opportunityScore * 0.45 +
      marketAttractivenessScore * 0.35 +
      competitionScore * 0.2
  );
  const marketIntelligenceScore = clampScore(
    marketOpportunityScore * 0.34 +
      marketAttractivenessScore * 0.24 +
      competitionScore * 0.16 +
      customerDemandSignals * 0.16 +
      sourceScore * 0.1
  );

  return {
    market_intelligence_score: marketIntelligenceScore,
    market_size_indicators: marketSizeIndicators,
    growth_indicators: growthIndicators,
    competitive_intensity: competitiveIntensity,
    customer_demand_signals: customerDemandSignals,
    industry_maturity: industryMaturity,
    market_opportunity_score: marketOpportunityScore,
    competitor_density: competitorDensity,
    differentiation_opportunity: differentiationOpportunity,
    market_gaps: marketGaps,
    entry_difficulty: entryDifficulty,
    market_attractiveness_score: marketAttractivenessScore,
    competition_score: competitionScore,
    opportunity_score: opportunityScore,
    maturity_score: maturityScore,
    market_risk_level: riskFromScore(entryDifficulty),
    opportunity_level: levelFromScore(opportunityScore),
    competitive_pressure: pressureFromScore(competitiveIntensity),
    market_industry: input.context?.inputs.industry || "Unknown",
    market_business_model: input.context?.inputs.businessModel || "Unknown",
    market_intelligence_version: "v2",
  };
}
