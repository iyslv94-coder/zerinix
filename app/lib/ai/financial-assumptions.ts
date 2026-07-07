import crypto from "node:crypto";

export type ReportKind = "business_plan" | "market_analysis";

export type AiFinancialModelContext = {
  version: "ai_financial_model_v2";
  fingerprint: string;
  reportKind: ReportKind;
  normalizedBusinessIdea: string;
  modelingInputs: {
    industry: string;
    businessModel: string;
    targetCustomer: string;
    geography: string;
    pricingModel: string;
  };
  requiredMetrics: string[];
};

function hashAiPayload(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeAiPrompt(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

function firstMatchingLabel(value: string, matches: Array<[RegExp, string]>) {
  return matches.find(([pattern]) => pattern.test(value))?.[1] ?? "infer from business idea";
}

function inferModelingInputs(prompt: string) {
  const normalized = normalizeAiPrompt(prompt);

  return {
    industry: firstMatchingLabel(normalized, [
      [/\b(hotel|resort|hospitality|travel)\b/, "hospitality"],
      [/\b(hospital|clinic|healthcare|medical|patient)\b/, "healthcare"],
      [/\b(yacht|marine|boat|ship)\b/, "marine luxury goods"],
      [/\b(battery|ev|electric vehicle|manufacturing|factory)\b/, "advanced manufacturing"],
      [/\b(farming|agriculture|vertical farm|food)\b/, "agriculture / food systems"],
      [/\b(cybersecurity|security|soc|compliance)\b/, "cybersecurity"],
      [/\b(crm|saas|software|ai|assistant|automation)\b/, "software / AI"],
      [/\b(gym|fitness|franchise)\b/, "fitness / franchise"],
    ]),
    businessModel: firstMatchingLabel(normalized, [
      [/\b(saas|subscription|platform|software)\b/, "subscription software"],
      [/\b(marketplace|two-sided|two sided)\b/, "marketplace"],
      [/\b(franchise|chain)\b/, "multi-location / franchise"],
      [/\b(manufacturer|manufacturing|factory|battery|yacht)\b/, "asset-heavy manufacturing"],
      [/\b(hotel|hospital|clinic|gym|restaurant)\b/, "asset-heavy operating company"],
      [/\b(consulting|agency|service|studio)\b/, "services"],
    ]),
    targetCustomer: firstMatchingLabel(normalized, [
      [/\b(hospital|clinic|doctor|patient|healthcare)\b/, "healthcare buyers / operators"],
      [/\b(enterprise|b2b|company|companies|business)\b/, "B2B / enterprise customers"],
      [/\b(luxury|premium|affluent|private)\b/, "premium consumer / high-net-worth customers"],
      [/\b(founder|startup|smb|small business)\b/, "startups and SMBs"],
      [/\b(government|public sector|municipal)\b/, "public-sector buyers"],
    ]),
    geography: firstMatchingLabel(normalized, [
      [/\b(us|usa|united states|america)\b/, "United States"],
      [/\b(uk|united kingdom|london)\b/, "United Kingdom"],
      [/\b(europe|eu|germany|france|italy|spain)\b/, "Europe"],
      [/\b(turkey|türkiye|istanbul)\b/, "Turkey"],
      [/\b(gcc|uae|dubai|saudi|qatar)\b/, "GCC / Middle East"],
      [/\b(global|worldwide|international)\b/, "global"],
    ]),
    pricingModel: firstMatchingLabel(normalized, [
      [/\b(subscription|monthly|annual|saas)\b/, "subscription"],
      [/\b(usage|per use|consumption)\b/, "usage-based"],
      [/\b(take rate|commission|marketplace)\b/, "take-rate / commission"],
      [/\b(franchise)\b/, "franchise fee plus royalties"],
      [/\b(luxury|premium|hotel|yacht|hospital|clinic|gym)\b/, "premium ticket / membership / service package"],
      [/\b(manufacturer|manufacturing|battery|factory)\b/, "unit sales plus service contracts"],
    ]),
  };
}

const requiredFinancialMetrics = [
  "TAM",
  "SAM",
  "SOM",
  "ARPA",
  "MRR",
  "ARR",
  "CAC",
  "LTV",
  "Gross Margin",
  "Burn Rate",
  "Runway",
  "EBITDA",
  "Break-even Month",
  "Investment Needed",
  "Payback Period",
];

export function createCanonicalFinancialAssumptions(input: {
  prompt: string;
  reportKind: ReportKind;
}): AiFinancialModelContext {
  const normalizedBusinessIdea = normalizeAiPrompt(input.prompt);
  const modelingInputs = inferModelingInputs(input.prompt);
  const fingerprint = hashAiPayload(
    JSON.stringify({
      version: "ai_financial_model_v2",
      prompt: normalizedBusinessIdea,
      reportKind: input.reportKind,
      modelingInputs,
      requiredFinancialMetrics,
    })
  ).slice(0, 16);

  return {
    version: "ai_financial_model_v2",
    fingerprint,
    reportKind: input.reportKind,
    normalizedBusinessIdea,
    modelingInputs,
    requiredMetrics: requiredFinancialMetrics,
  };
}

export function formatCanonicalFinancialAssumptions(
  context: AiFinancialModelContext
) {
  return `AI-Driven Financial Modeling Engine (${context.version}, ${context.fingerprint})
Business idea fingerprint: ${context.normalizedBusinessIdea}
Detected modeling inputs:
- Industry: ${context.modelingInputs.industry}
- Business model: ${context.modelingInputs.businessModel}
- Target customer: ${context.modelingInputs.targetCustomer}
- Geography: ${context.modelingInputs.geography}
- Pricing model: ${context.modelingInputs.pricingModel}

Required dynamic financial outputs:
${context.requiredMetrics.map((metric) => `- ${metric}`).join("\n")}

Financial modeling rules:
- Do not use hardcoded generic ranges or canned profile assumptions.
- First build one internal financial model from the business idea, target customer, pricing model, industry, geography, and business model.
- Estimate TAM, SAM, SOM, ARPA, MRR, ARR, CAC, LTV, Gross Margin, Burn Rate, Runway, EBITDA, Break-even Month, Investment Needed, and Payback Period dynamically for this exact company concept.
- Make every number internally consistent: ARR = MRR x 12; Payback Period must follow CAC, ARPA, and Gross Margin; Runway must follow Burn Rate and Investment Needed; EBITDA must follow Revenue, Gross Margin, and Expenses.
- Use specific point estimates or tight ranges wherever possible. Only use broad ranges when the user input lacks a necessary driver, and explain the missing driver.
- Mark confidence for every estimate as High, Medium, or Low based on evidence quality, input specificity, market maturity, pricing comparability, and operating-model uncertainty.
- Financial Dashboard, Unit Economics, Scenario Analysis, Executive Summary, Executive Recommendation, KPI Dashboard, and Financial Assumptions must all reuse the same internal model values.
- No section may invent a second CAC, LTV, ARPA, MRR, ARR, margin, burn, runway, payback, EBITDA, break-even, investment, TAM, SAM, or SOM value.
- If a metric is uncertain, label it as an assumption needing validation rather than substituting a generic benchmark.
- Different business ideas must produce materially different financial values.`;
}
