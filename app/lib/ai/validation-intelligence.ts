import type { DecisionConfidenceModel } from "@/app/lib/ai/decision-confidence";
import type { FinancialConsistencyCheck, FinancialModel } from "@/app/lib/ai/financial-model";
import type { SourceIntelligenceModel } from "@/app/lib/ai/source-intelligence";

export type ValidationType =
  | "Customer Interview"
  | "Pricing Test"
  | "Landing Page Test"
  | "Paid Acquisition Test"
  | "B2B Pilot"
  | "Prototype Test"
  | "Market Research";

export type ValidationScore = "Not Started" | "In Progress" | "Validated";

export type ValidationExperiment = {
  priority: number;
  assumption: string;
  risk: string;
  type: ValidationType;
  action: string;
  successCriteria: string;
  score: ValidationScore;
};

export type ValidationIntelligenceModel = {
  version: "validation_intelligence_engine_v1";
  score: ValidationScore;
  experiments: ValidationExperiment[];
};

function hasUserEvidence(financialConsistency: FinancialConsistencyCheck) {
  return financialConsistency.sources.userProvidedData.some((item) =>
    /supplied validation evidence|provided/i.test(item)
  );
}

function getValidationScore(input: {
  financialConsistency: FinancialConsistencyCheck;
  decisionConfidence: DecisionConfidenceModel;
}) {
  if (hasUserEvidence(input.financialConsistency) && input.decisionConfidence.confidenceScore >= 72) {
    return "Validated";
  }

  if (hasUserEvidence(input.financialConsistency) || input.decisionConfidence.confidenceScore >= 55) {
    return "In Progress";
  }

  return "Not Started";
}

export function createValidationIntelligenceModel(input: {
  financialModel: FinancialModel;
  financialConsistency: FinancialConsistencyCheck;
  sourceIntelligence: SourceIntelligenceModel;
  decisionConfidence: DecisionConfidenceModel;
}): ValidationIntelligenceModel {
  const { financialModel, financialConsistency, sourceIntelligence, decisionConfidence } = input;
  const isB2B = /b2b|enterprise|company|companies|kurumsal/i.test(financialModel.inputs.businessModel) ||
    /b2b|enterprise|company|companies|kurumsal/i.test(financialModel.inputs.targetCustomer);
  const lowConfidenceSource = sourceIntelligence.items.find((item) => item.confidence === "Low Confidence");
  const experiments: ValidationExperiment[] = [
    {
      priority: 1,
      assumption: "Customer demand exists",
      risk: "No customer validation",
      type: "Customer Interview",
      action: "Run 50 customer interviews",
      successCriteria: "30%+ strong purchase intent",
      score: hasUserEvidence(financialConsistency) ? "In Progress" : "Not Started",
    },
    {
      priority: 2,
      assumption: `${financialModel.metrics.cac.label} <= ${financialModel.metrics.cac.displayValue}`,
      risk: "CAC not validated",
      type: "Paid Acquisition Test",
      action: "Run a $500 acquisition experiment",
      successCriteria: `${financialModel.metrics.cac.label} <= ${financialModel.metrics.cac.displayValue}`,
      score: financialModel.metrics.cac.confidence === "High" ? "In Progress" : "Not Started",
    },
    {
      priority: 3,
      assumption: `${financialModel.metrics.arpa.label} ${financialModel.metrics.arpa.displayValue} accepted`,
      risk: "Willingness to pay not proven",
      type: "Pricing Test",
      action: "Test 3 pricing packages",
      successCriteria: "20%+ conversion intent",
      score: financialModel.metrics.arpa.confidence === "High" ? "In Progress" : "Not Started",
    },
    {
      priority: 4,
      assumption: isB2B ? "B2B demand exists" : "Market positioning converts qualified interest",
      risk: isB2B ? "B2B demand not proven" : "Messaging and conversion not proven",
      type: isB2B ? "B2B Pilot" : "Landing Page Test",
      action: isB2B ? "Interview 20 target companies" : "Launch a landing page with one offer and one CTA",
      successCriteria: isB2B ? "5+ pilot commitments" : "10%+ qualified conversion intent",
      score: "Not Started",
    },
    {
      priority: 5,
      assumption: lowConfidenceSource?.area || "Market assumptions require validation",
      risk: lowConfidenceSource?.summary || "Market evidence is incomplete",
      type: lowConfidenceSource?.area === "Competitor Insights" ? "Market Research" : "Prototype Test",
      action: lowConfidenceSource?.area === "Competitor Insights"
        ? "Validate competitors, substitutes, and pricing from primary sources"
        : "Test the smallest prototype or concierge workflow",
      successCriteria: lowConfidenceSource?.area === "Competitor Insights"
        ? "5+ verified competitor/source checks"
        : "5+ qualified users complete the core workflow",
      score: "Not Started",
    },
  ];

  return {
    version: "validation_intelligence_engine_v1",
    score: getValidationScore({ financialConsistency, decisionConfidence }),
    experiments,
  };
}
