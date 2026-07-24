import "server-only";

import type { AiFinancialModelContext } from "@/app/lib/ai/financial-assumptions";
import type { ExecutiveDecisionIntelligence } from "@/app/lib/executive-decision-intelligence";
import type { FounderOperatingSystem } from "@/app/lib/founder-operating-system";
import type { MarketIntelligence } from "@/app/lib/market-intelligence";
import type { ReportConfidenceMetadata } from "@/app/lib/report-confidence";
import type { SourceReliabilitySummary } from "@/app/lib/source-reliability";

export type PersonalizationSettings = {
  depth_level: "light" | "standard" | "deep";
  strategic_focus: "validation" | "growth" | "fundraising" | "efficiency" | "market_entry";
  recommendation_style: "action_oriented" | "investor_memo" | "risk_first" | "operator_playbook";
  benchmark_priority: "industry" | "business_model" | "geography" | "financial";
  risk_emphasis: "low" | "medium" | "high";
};

export type ReportPersonalizationMetadata = PersonalizationSettings & {
  personalization_score: number;
  personalization_profile: {
    industry: string;
    business_stage: string;
    founder_goal: string;
    target_market: string;
    company_size: string;
    user_intent: string;
  };
  adapted_recommendation_context: string[];
  personalization_version: "v1";
};

type PersonalizationInput = {
  prompt: string;
  report: Record<string, string>;
  context: AiFinancialModelContext;
  confidence: ReportConfidenceMetadata;
  sources: SourceReliabilitySummary;
  decision: ExecutiveDecisionIntelligence;
  market: MarketIntelligence;
  founderOs: FounderOperatingSystem;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function countMatches(text: string, pattern: RegExp) {
  return (text.match(pattern) || []).length;
}

function inferFounderGoal(text: string) {
  if (/\b(?:fund|funding|investment|investor|raise|yatırım|fon)\b/i.test(text)) return "fundraising";
  if (/\b(?:pricing|fiyat|price|monetization|gelir)\b/i.test(text)) return "pricing";
  if (/\b(?:market|pazar|competitor|rakip|entry|giriş)\b/i.test(text)) return "market_entry";
  if (/\b(?:scale|growth|büyüme|expand|genişle)\b/i.test(text)) return "growth";
  if (/\b(?:validate|validation|doğrula|test|pilot)\b/i.test(text)) return "validation";
  return "strategy";
}

function inferBusinessStage(text: string) {
  if (/\b(?:idea|fikir|kurmak istiyorum|pre-seed|concept)\b/i.test(text)) return "idea";
  if (/\b(?:mvp|pilot|prototype|beta)\b/i.test(text)) return "validation";
  if (/\b(?:revenue|gelir|customer|müşteri|traction|satış)\b/i.test(text)) return "early_revenue";
  if (/\b(?:scale|series|expand|büyüme|genişleme)\b/i.test(text)) return "scaling";
  return "unknown";
}

function inferCompanySize(text: string) {
  if (/\b(?:enterprise|kurumsal|100\+|large team|çok lokasyon)\b/i.test(text)) return "larger_team";
  if (/\b(?:team|ekip|employees|çalışan)\b/i.test(text)) return "small_team";
  return "founder_led";
}

function inferTargetMarket(text: string) {
  if (/\bturkey|türkiye|istanbul|ankara|izmir\b/i.test(text)) return "Turkey";
  if (/\beurope|avrupa|eu\b/i.test(text)) return "Europe";
  if (/\busa|us market|america|amerika\b/i.test(text)) return "United States";
  if (/\bglobal|international|uluslararası\b/i.test(text)) return "Global";
  return "Unspecified";
}

function strategicFocus(goal: string): PersonalizationSettings["strategic_focus"] {
  if (goal === "fundraising") return "fundraising";
  if (goal === "growth") return "growth";
  if (goal === "market_entry") return "market_entry";
  if (goal === "pricing") return "efficiency";
  return "validation";
}

function recommendationStyle(input: {
  stage: string;
  riskEmphasis: PersonalizationSettings["risk_emphasis"];
  goal: string;
}): PersonalizationSettings["recommendation_style"] {
  if (input.riskEmphasis === "high") return "risk_first";
  if (input.goal === "fundraising") return "investor_memo";
  if (input.stage === "scaling" || input.goal === "growth") return "operator_playbook";
  return "action_oriented";
}

function benchmarkPriority(goal: string): PersonalizationSettings["benchmark_priority"] {
  if (goal === "market_entry") return "geography";
  if (goal === "pricing" || goal === "fundraising") return "financial";
  if (goal === "growth") return "business_model";
  return "industry";
}

export function createReportPersonalization(input: PersonalizationInput): ReportPersonalizationMetadata {
  const reportText = Object.values(input.report).join("\n");
  const combinedText = `${input.prompt}\n${reportText}`;
  const founderGoal = inferFounderGoal(combinedText);
  const businessStage = inferBusinessStage(combinedText);
  const companySize = inferCompanySize(combinedText);
  const targetMarket = inferTargetMarket(combinedText);
  const riskEmphasis: PersonalizationSettings["risk_emphasis"] =
    input.decision.execution_complexity >= 70 || input.market.market_risk_level === "high"
      ? "high"
      : input.decision.execution_complexity >= 45
        ? "medium"
        : "low";
  const detailSignals = countMatches(combinedText, /\b(?:because|why|nasıl|neden|compare|karşılaştır|financial|finansal|competitor|rakip)\b/gi);
  const depthLevel: PersonalizationSettings["depth_level"] =
    detailSignals >= 8 || input.sources.source_count >= 4
      ? "deep"
      : detailSignals >= 3
        ? "standard"
        : "light";
  const settings: PersonalizationSettings = {
    depth_level: depthLevel,
    strategic_focus: strategicFocus(founderGoal),
    recommendation_style: recommendationStyle({
      stage: businessStage,
      riskEmphasis,
      goal: founderGoal,
    }),
    benchmark_priority: benchmarkPriority(founderGoal),
    risk_emphasis: riskEmphasis,
  };
  const confidenceScore =
    input.confidence.overall_confidence === "High"
      ? 85
      : input.confidence.overall_confidence === "Medium"
        ? 62
        : 35;
  const personalizationScore = clampScore(
    35 +
      (founderGoal !== "strategy" ? 12 : 0) +
      (businessStage !== "unknown" ? 12 : 0) +
      (targetMarket !== "Unspecified" ? 10 : 0) +
      Math.min(10, detailSignals * 2) +
      confidenceScore * 0.18 +
      input.founderOs.founder_health_score * 0.12
  );

  return {
    ...settings,
    personalization_score: personalizationScore,
    personalization_profile: {
      industry: input.context.inputs.industry,
      business_stage: businessStage,
      founder_goal: founderGoal,
      target_market: targetMarket,
      company_size: companySize,
      user_intent: founderGoal,
    },
    adapted_recommendation_context: [
      `Focus recommendations on ${settings.strategic_focus}.`,
      `Use ${settings.recommendation_style.replace(/_/g, " ")} guidance.`,
      `Prioritize ${settings.benchmark_priority.replace(/_/g, " ")} benchmarks.`,
      `Apply ${settings.risk_emphasis} risk emphasis.`,
    ],
    personalization_version: "v1",
  };
}
