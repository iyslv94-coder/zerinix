import crypto from "node:crypto";
import type { BenchmarkConfidence } from "@/app/lib/ai/industry-benchmarks";
import type { FinancialModel } from "@/app/lib/ai/financial-model";

export type InvestmentScoreCategoryKey =
  | "marketOpportunity"
  | "competitiveAdvantage"
  | "businessModel"
  | "financialHealth"
  | "scalability"
  | "teamFounder"
  | "capitalEfficiency"
  | "executionRisk";

export type InvestmentScoreCategory = {
  key: InvestmentScoreCategoryKey;
  label: string;
  score: number;
  maximumScore: number;
  explanation: string;
  reasoning: string[];
};

export type InvestmentScore = {
  version: "investment_score_engine_v1";
  fingerprint: string;
  totalScore: number;
  confidence: number;
  recommendation: "GO" | "WAIT" | "PASS";
  estimatedValuation: string;
  fundingStage: string;
  nextCriticalAction: string;
  strengths: string[];
  weaknesses: string[];
  topRisks: string[];
  categories: Record<InvestmentScoreCategoryKey, InvestmentScoreCategory>;
  decisionEngine: Record<
    | "marketScore"
    | "financialScore"
    | "founderScore"
    | "executionScore"
    | "riskScore"
    | "competitionScore"
    | "technologyScore",
    InvestmentScoreCategory
  >;
};

type InvestmentScoreInput = {
  prompt: string;
  financialModel: FinancialModel;
};

const CATEGORY_WEIGHTS: Record<InvestmentScoreCategoryKey, number> = {
  marketOpportunity: 15,
  competitiveAdvantage: 12,
  businessModel: 13,
  financialHealth: 15,
  scalability: 12,
  teamFounder: 10,
  capitalEfficiency: 13,
  executionRisk: 10,
};

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizePrompt(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundScore(value: number) {
  return Math.round(clamp(value, 0, 100));
}

function weightedScore(score: number, maximumScore: number) {
  return Math.round(clamp(score, 0, 1) * maximumScore);
}

function normalizeHigherBetter(value: number, low: number, high: number) {
  if (high <= low) return 0.5;
  return clamp((value - low) / (high - low), 0, 1);
}

function normalizeLowerBetter(value: number, good: number, poor: number) {
  if (poor <= good) return 0.5;
  return clamp(1 - (value - good) / (poor - good), 0, 1);
}

function confidenceValue(confidence: BenchmarkConfidence) {
  if (confidence === "High") return 85;
  if (confidence === "Medium") return 65;
  return 45;
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function hasAny(value: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(value));
}

function promptSpecificityScore(prompt: string) {
  const normalized = normalizePrompt(prompt);
  const signals = [
    /\b(b2b|b2c|enterprise|consumer|smb|hospital|clinic|hotel|restaurant|manufacturer|founder|developer)\b/,
    /\b(us|usa|uk|europe|turkey|gcc|global|london|istanbul|dubai)\b/,
    /\b(subscription|marketplace|franchise|usage-based|premium|luxury|enterprise sales|direct sales)\b/,
    /\b(ai|cybersecurity|healthcare|fintech|logistics|manufacturing|coffee|ev|saas)\b/,
    /\b(monthly|annual|arr|mrr|cac|ltv|margin|pricing|customers)\b/,
  ];
  const matchedSignals = signals.filter((pattern) => pattern.test(normalized)).length;

  return clamp(0.35 + matchedSignals * 0.13, 0.35, 1);
}

function makeCategory(input: {
  key: InvestmentScoreCategoryKey;
  label: string;
  normalizedScore: number;
  explanation: string;
  reasoning: string[];
}): InvestmentScoreCategory {
  const maximumScore = CATEGORY_WEIGHTS[input.key];

  return {
    key: input.key,
    label: input.label,
    maximumScore,
    score: weightedScore(input.normalizedScore, maximumScore),
    explanation: input.explanation,
    reasoning: input.reasoning,
  };
}

function formatUsd(value: number) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}k`;

  return `${sign}$${Math.round(abs).toLocaleString("en-US")}`;
}

function createStrengths(categories: InvestmentScoreCategory[], model: FinancialModel) {
  const topCategories = [...categories]
    .sort((a, b) => b.score / b.maximumScore - a.score / a.maximumScore)
    .slice(0, 3)
    .map((category) => `${category.label}: ${category.explanation}`);

  if (model.metrics.grossMargin.value >= model.benchmark.ranges.grossMargin.low) {
    topCategories.push(
      `Gross margin discipline: ${model.metrics.grossMargin.displayValue} sits ${model.metrics.grossMargin.benchmarkComparison.toLowerCase()}.`
    );
  }

  return topCategories.slice(0, 4);
}

function createWeaknesses(categories: InvestmentScoreCategory[], model: FinancialModel) {
  const bottomCategories = [...categories]
    .sort((a, b) => a.score / a.maximumScore - b.score / b.maximumScore)
    .slice(0, 3)
    .map((category) => `${category.label}: ${category.explanation}`);

  if (model.metrics.cacPayback.value > model.benchmark.ranges.cacPayback.high) {
    bottomCategories.push(
      `CAC payback risk: ${model.metrics.cacPayback.displayValue} is above the benchmark range.`
    );
  }

  return bottomCategories.slice(0, 4);
}

function createRecommendation(totalScore: number, confidence: number) {
  if (totalScore >= 72 && confidence >= 60) return "GO";
  if (totalScore < 48 || confidence < 42) return "PASS";
  return "WAIT";
}

function createFundingStage(model: FinancialModel) {
  const investmentNeeded = model.metrics.investmentNeeded.value;
  const arr = model.metrics.arr.value;

  if (arr < 250_000 && investmentNeeded < 750_000) return "Pre-seed";
  if (arr < 1_500_000 && investmentNeeded < 3_000_000) return "Seed";
  if (arr < 8_000_000 && investmentNeeded < 10_000_000) return "Seed / Series A";
  return "Series A+ / growth capital";
}

function createEstimatedValuation(model: FinancialModel) {
  const multiple = average([
    model.benchmark.ranges.revenueMultiple.low,
    model.benchmark.ranges.revenueMultiple.high,
  ]);
  const baseValuation = Math.max(
    model.metrics.arr.value * multiple,
    model.metrics.investmentNeeded.value * 1.25
  );

  return `${formatUsd(baseValuation * 0.8)}-${formatUsd(baseValuation * 1.2)}`;
}

function createNextCriticalAction(model: FinancialModel, recommendation: "GO" | "WAIT" | "PASS") {
  if (recommendation === "PASS") {
    return "Do not scale spend until the weakest economics are redesigned and validated.";
  }

  if (model.metrics.cacPayback.value > model.benchmark.ranges.cacPayback.high) {
    return "Validate a lower-CAC acquisition motion before increasing budget.";
  }

  if (model.metrics.grossMargin.confidence === "Low" || model.metrics.tam.confidence === "Low") {
    return "Run primary research to validate market size and contribution margin assumptions.";
  }

  if (recommendation === "GO") {
    return "Convert the strongest ICP into paid pilots using the calculated pricing and payback targets.";
  }

  return "Validate pricing, buyer urgency, and repeatable acquisition before committing full funding.";
}

function createTopRisks(model: FinancialModel, categories: InvestmentScoreCategory[]) {
  const risks = [
    `Execution risk: ${categories.find((category) => category.key === "executionRisk")?.explanation}`,
    `Capital efficiency: investment need is ${model.metrics.investmentNeeded.displayValue} against ${model.metrics.arr.displayValue} Year-1 ARR.`,
    `Confidence: ${model.benchmark.label} assumptions require primary validation where confidence is Low.`,
  ].filter(Boolean);

  if (model.metrics.cacPayback.value > model.benchmark.ranges.cacPayback.high) {
    risks.unshift(`Payback risk: ${model.metrics.cacPayback.displayValue} exceeds the benchmark range.`);
  }

  if (model.metrics.runway.value < 12) {
    risks.unshift(`Runway risk: ${model.metrics.runway.displayValue} gives limited iteration time.`);
  }

  return risks.slice(0, 3);
}

export function createInvestmentScore(input: InvestmentScoreInput): InvestmentScore {
  const model = input.financialModel;
  const metrics = model.metrics;
  const ranges = model.benchmark.ranges;
  const normalizedPrompt = normalizePrompt(input.prompt);
  const specificity = promptSpecificityScore(input.prompt);
  const capitalHeavy = hasAny(normalizedPrompt, [
    /\b(manufacturing|factory|hospital|hotel|yacht|ev charging|battery|clinic|franchise|drone|uav)\b/,
  ]);
  const defensibilitySignals = hasAny(normalizedPrompt, [
    /\b(proprietary|patent|data moat|network effect|regulated|compliance|brand|luxury|enterprise)\b/,
  ]);
  const founderSignals = hasAny(normalizedPrompt, [
    /\b(founder|team|operator|doctor|engineer|expert|experienced|domain)\b/,
  ]);
  const recurringRevenue =
    model.inputs.businessModel.includes("subscription") ||
    model.inputs.pricingModel.includes("subscription") ||
    model.inputs.pricingModel.includes("membership");

  const marketOpportunity = makeCategory({
    key: "marketOpportunity",
    label: "Market Opportunity",
    normalizedScore: average([
      normalizeHigherBetter(metrics.sam.value, 50_000_000, 2_500_000_000),
      normalizeHigherBetter(metrics.som.value, 1_000_000, 80_000_000),
      normalizeHigherBetter(metrics.revenueGrowth.value, ranges.arrGrowth.low, ranges.arrGrowth.high),
      specificity,
    ]),
    explanation: `${model.inputs.industry} opportunity is scored from SAM (${metrics.sam.displayValue}), SOM (${metrics.som.displayValue}), and benchmark growth (${metrics.revenueGrowth.displayValue}).`,
    reasoning: [
      `SAM: ${metrics.sam.displayValue}`,
      `SOM: ${metrics.som.displayValue}`,
      `Revenue growth benchmark: ${metrics.revenueGrowth.benchmarkComparison}`,
      `Input specificity multiplier: ${Math.round(specificity * 100)}%`,
    ],
  });

  const competitiveAdvantage = makeCategory({
    key: "competitiveAdvantage",
    label: "Competitive Advantage",
    normalizedScore: average([
      defensibilitySignals ? 0.78 : 0.48,
      normalizeHigherBetter(metrics.grossMargin.value, ranges.grossMargin.low, ranges.grossMargin.high),
      normalizeHigherBetter(ranges.revenueMultiple.high, 3, 16),
      capitalHeavy ? 0.58 : 0.66,
    ]),
    explanation: defensibilitySignals
      ? "The prompt includes defensibility signals, but the score still depends on margin quality and benchmark valuation potential."
      : "Defensibility is only partially evidenced; the score relies mostly on benchmark economics until moat proof exists.",
    reasoning: [
      `Defensibility signals detected: ${defensibilitySignals ? "yes" : "no"}`,
      `Gross margin: ${metrics.grossMargin.displayValue}`,
      `Revenue multiple benchmark: ${ranges.revenueMultiple.low}x-${ranges.revenueMultiple.high}x`,
      `Capital intensity adjustment: ${capitalHeavy ? "negative" : "neutral"}`,
    ],
  });

  const businessModel = makeCategory({
    key: "businessModel",
    label: "Business Model",
    normalizedScore: average([
      recurringRevenue ? 0.8 : 0.58,
      normalizeHigherBetter(metrics.grossMargin.value, ranges.grossMargin.low, ranges.grossMargin.high),
      normalizeLowerBetter(metrics.cacPayback.value, ranges.cacPayback.low, ranges.cacPayback.high),
      normalizeHigherBetter(metrics.ltv.value / Math.max(1, metrics.cac.value), 2, 6),
    ]),
    explanation: `Business-model quality is calculated from pricing model (${model.inputs.pricingModel}), gross margin, payback, and LTV/CAC.`,
    reasoning: [
      `Pricing model: ${model.inputs.pricingModel}`,
      `Gross margin: ${metrics.grossMargin.displayValue}`,
      `CAC payback: ${metrics.cacPayback.displayValue}`,
      `LTV/CAC: ${(metrics.ltv.value / Math.max(1, metrics.cac.value)).toFixed(1)}x`,
    ],
  });

  const financialHealth = makeCategory({
    key: "financialHealth",
    label: "Financial Health",
    normalizedScore: average([
      normalizeHigherBetter(metrics.grossMargin.value, ranges.grossMargin.low, ranges.grossMargin.high),
      normalizeHigherBetter(metrics.ebitda.value / Math.max(1, metrics.arr.value), ranges.ebitdaMargin.low, ranges.ebitdaMargin.high),
      normalizeHigherBetter(metrics.runway.value, 9, 24),
      normalizeLowerBetter(metrics.breakEvenMonth.value, 12, 48),
    ]),
    explanation: `Financial health is based on margin, EBITDA profile, runway (${metrics.runway.displayValue}), and break-even timing (${metrics.breakEvenMonth.displayValue}).`,
    reasoning: [
      `EBITDA: ${metrics.ebitda.displayValue}`,
      `Runway: ${metrics.runway.displayValue}`,
      `Break-even: ${metrics.breakEvenMonth.displayValue}`,
      `Gross margin benchmark: ${metrics.grossMargin.benchmarkComparison}`,
    ],
  });

  const scalability = makeCategory({
    key: "scalability",
    label: "Scalability",
    normalizedScore: average([
      normalizeHigherBetter(metrics.revenueGrowth.value, ranges.arrGrowth.low, ranges.arrGrowth.high),
      normalizeHigherBetter(metrics.grossMargin.value, ranges.grossMargin.low, ranges.grossMargin.high),
      normalizeHigherBetter(metrics.arr.value, 500_000, 15_000_000),
      capitalHeavy ? 0.46 : 0.72,
    ]),
    explanation: `Scalability is derived from growth rate, gross margin, Year-1 ARR (${metrics.arr.displayValue}), and capital intensity.`,
    reasoning: [
      `Revenue growth: ${metrics.revenueGrowth.displayValue}`,
      `Year-1 ARR: ${metrics.arr.displayValue}`,
      `Gross margin: ${metrics.grossMargin.displayValue}`,
      `Capital-heavy model: ${capitalHeavy ? "yes" : "no"}`,
    ],
  });

  const teamFounder = makeCategory({
    key: "teamFounder",
    label: "Team / Founder",
    normalizedScore: average([
      founderSignals ? 0.74 : 0.45,
      specificity,
      model.benchmark.label === "Services" ? 0.58 : 0.62,
    ]),
    explanation: founderSignals
      ? "Founder/team evidence is present in the prompt and is adjusted by input specificity."
      : "Founder/team quality cannot be strongly scored without operator background, domain proof, or hiring plan.",
    reasoning: [
      `Founder or domain signals detected: ${founderSignals ? "yes" : "no"}`,
      `Input specificity: ${Math.round(specificity * 100)}%`,
      `Industry execution context: ${model.inputs.industry}`,
    ],
  });

  const capitalEfficiency = makeCategory({
    key: "capitalEfficiency",
    label: "Capital Efficiency",
    normalizedScore: average([
      normalizeLowerBetter(metrics.investmentNeeded.value / Math.max(1, metrics.arr.value), 1, 8),
      normalizeLowerBetter(metrics.cacPayback.value, ranges.cacPayback.low, ranges.cacPayback.high),
      normalizeHigherBetter(metrics.roi.value, -0.5, 2),
      capitalHeavy ? 0.42 : 0.72,
    ]),
    explanation: `Capital efficiency is calculated from investment-to-ARR, payback, Year-3 ROI, and capital intensity.`,
    reasoning: [
      `Investment needed: ${metrics.investmentNeeded.displayValue}`,
      `ARR: ${metrics.arr.displayValue}`,
      `CAC payback: ${metrics.cacPayback.displayValue}`,
      `ROI: ${metrics.roi.displayValue}`,
    ],
  });

  const executionRisk = makeCategory({
    key: "executionRisk",
    label: "Execution Risk",
    normalizedScore: average([
      normalizeLowerBetter(metrics.cacPayback.value, ranges.cacPayback.low, ranges.cacPayback.high),
      normalizeLowerBetter(metrics.breakEvenMonth.value, 12, 48),
      normalizeHigherBetter(average(Object.values(metrics).map((metric) => confidenceValue(metric.confidence))), 45, 85),
      capitalHeavy ? 0.38 : 0.7,
    ]),
    explanation: `Execution risk score improves when payback and break-even are faster, confidence is higher, and the model is less asset-heavy.`,
    reasoning: [
      `CAC payback: ${metrics.cacPayback.displayValue}`,
      `Break-even: ${metrics.breakEvenMonth.displayValue}`,
      `Average metric confidence: ${Math.round(average(Object.values(metrics).map((metric) => confidenceValue(metric.confidence))))}%`,
      `Asset-heavy risk: ${capitalHeavy ? "elevated" : "moderate"}`,
    ],
  });

  const categoryList = [
    marketOpportunity,
    competitiveAdvantage,
    businessModel,
    financialHealth,
    scalability,
    teamFounder,
    capitalEfficiency,
    executionRisk,
  ];
  const totalScore = roundScore(
    categoryList.reduce((sum, category) => sum + category.score, 0)
  );
  const confidence = roundScore(
    average([
      average(Object.values(metrics).map((metric) => confidenceValue(metric.confidence))),
      specificity * 100,
      founderSignals ? 72 : 58,
      defensibilitySignals ? 72 : 58,
    ])
  );
  const recommendation = createRecommendation(totalScore, confidence);
  const technologyScore = makeCategory({
    key: "competitiveAdvantage",
    label: "Technology Score",
    normalizedScore: average([
      hasAny(normalizedPrompt, [/\b(ai|software|automation|cybersecurity|drone|uav|ev|battery|platform)\b/])
        ? 0.76
        : 0.48,
      defensibilitySignals ? 0.74 : 0.5,
      normalizeHigherBetter(metrics.grossMargin.value, ranges.grossMargin.low, ranges.grossMargin.high),
    ]),
    explanation: "Technology score is calculated from technical intensity, defensibility signals, and margin leverage.",
    reasoning: [
      `Technical signals detected: ${
        hasAny(normalizedPrompt, [/\b(ai|software|automation|cybersecurity|drone|uav|ev|battery|platform)\b/])
          ? "yes"
          : "no"
      }`,
      `Defensibility signals detected: ${defensibilitySignals ? "yes" : "no"}`,
      `Gross margin: ${metrics.grossMargin.displayValue}`,
    ],
  });
  const decisionEngine = {
    marketScore: {
      ...marketOpportunity,
      key: "marketOpportunity" as const,
      label: "Market Score",
      score: roundScore((marketOpportunity.score / marketOpportunity.maximumScore) * 100),
      maximumScore: 100,
    },
    financialScore: {
      ...financialHealth,
      key: "financialHealth" as const,
      label: "Financial Score",
      score: roundScore((financialHealth.score / financialHealth.maximumScore) * 100),
      maximumScore: 100,
    },
    founderScore: {
      ...teamFounder,
      key: "teamFounder" as const,
      label: "Founder Score",
      score: roundScore((teamFounder.score / teamFounder.maximumScore) * 100),
      maximumScore: 100,
    },
    executionScore: {
      ...executionRisk,
      key: "executionRisk" as const,
      label: "Execution Score",
      score: roundScore((executionRisk.score / executionRisk.maximumScore) * 100),
      maximumScore: 100,
    },
    riskScore: {
      ...executionRisk,
      key: "executionRisk" as const,
      label: "Risk Score",
      score: roundScore((executionRisk.score / executionRisk.maximumScore) * 100),
      maximumScore: 100,
    },
    competitionScore: {
      ...competitiveAdvantage,
      key: "competitiveAdvantage" as const,
      label: "Competition Score",
      score: roundScore((competitiveAdvantage.score / competitiveAdvantage.maximumScore) * 100),
      maximumScore: 100,
    },
    technologyScore: {
      ...technologyScore,
      score: roundScore((technologyScore.score / technologyScore.maximumScore) * 100),
      maximumScore: 100,
    },
  };

  return {
    version: "investment_score_engine_v1",
    fingerprint: hashValue(
      JSON.stringify({
        version: "investment_score_engine_v1",
        prompt: normalizedPrompt,
        financialModelFingerprint: model.fingerprint,
        totalScore,
        confidence,
      })
    ).slice(0, 16),
    totalScore,
    confidence,
    recommendation,
    estimatedValuation: createEstimatedValuation(model),
    fundingStage: createFundingStage(model),
    nextCriticalAction: createNextCriticalAction(model, recommendation),
    strengths: createStrengths(categoryList, model),
    weaknesses: createWeaknesses(categoryList, model),
    topRisks: createTopRisks(model, categoryList),
    categories: {
      marketOpportunity,
      competitiveAdvantage,
      businessModel,
      financialHealth,
      scalability,
      teamFounder,
      capitalEfficiency,
      executionRisk,
    },
    decisionEngine,
  };
}

export function formatInvestmentScore(score: InvestmentScore) {
  const categoryRows = Object.values(score.categories)
    .map(
      (category) =>
        `- ${category.label}: ${category.score}/${category.maximumScore} | explanation=${category.explanation} | reasoning=${category.reasoning.join("; ")}`
    )
    .join("\n");
  const strengths = score.strengths.map((strength) => `- ${strength}`).join("\n");
  const weaknesses = score.weaknesses.map((weakness) => `- ${weakness}`).join("\n");
  const risks = score.topRisks.map((risk) => `- ${risk}`).join("\n");
  const decisionRows = Object.values(score.decisionEngine)
    .map(
      (category) =>
        `- ${category.label}: ${category.score}/${category.maximumScore} | explanation=${category.explanation} | reasoning=${category.reasoning.join("; ")}`
    )
    .join("\n");

  return `Investment Scoring Engine (${score.version}, ${score.fingerprint})
Total Investment Score: ${score.totalScore}/100
Confidence: ${score.confidence}%
Recommendation: ${score.recommendation}
Estimated Valuation: ${score.estimatedValuation}
Funding Stage: ${score.fundingStage}
Next Critical Action: ${score.nextCriticalAction}

Category scores:
${categoryRows}

Decision Engine:
${decisionRows}

Strengths:
${strengths}

Weaknesses:
${weaknesses}

Top Risks:
${risks}`;
}
