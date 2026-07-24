export type EvidenceSourceType =
  | "Official Company"
  | "Government"
  | "Public Statistics"
  | "Market Report"
  | "Trusted News"
  | "Unknown";

export type StructuredExternalEvidence = {
  keyFacts?: string[];
  importantNumbers?: string[];
  sources?: Array<{
    title?: string;
    publisher?: string;
    url?: string;
    publishedAt?: string;
    type?: EvidenceSourceType;
  }>;
};

export type LiveEvidenceMetadata = {
  evidence_count: number;
  evidence_summary: {
    keyFacts: string[];
    importantNumbers: string[];
    publicationDates: string[];
    sourceList: Array<{
      name: string;
      url: string;
      type: EvidenceSourceType;
      publishedAt: string;
    }>;
  };
  newest_source: string;
  oldest_source: string;
  freshness_score: number;
  evidence_source_type_distribution: Record<EvidenceSourceType, number>;
};

const sourceTypes: EvidenceSourceType[] = [
  "Official Company",
  "Government",
  "Public Statistics",
  "Market Report",
  "Trusted News",
  "Unknown",
];

function emptySourceDistribution() {
  return Object.fromEntries(sourceTypes.map((type) => [type, 0])) as Record<
    EvidenceSourceType,
    number
  >;
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function classifyEvidenceSource(input: {
  title: string;
  publisher: string;
  url: string;
  type?: EvidenceSourceType;
}): EvidenceSourceType {
  if (input.type && sourceTypes.includes(input.type)) {
    return input.type;
  }

  const domain = getDomain(input.url);
  const text = `${input.title} ${input.publisher} ${domain}`;

  if (/\.(gov|gov\.tr|int)$/i.test(domain) || /\b(world bank|imf|oecd|eurostat|tüik|tuik|tcmb|ministry|government|central bank)\b/i.test(text)) {
    return "Government";
  }

  if (/\b(statistics|statistical|census|data portal|public data|tüik|tuik|eurostat|world bank data)\b/i.test(text)) {
    return "Public Statistics";
  }

  if (/\b(annual report|investor relations|official|company website|about us|sec filing|10-k)\b/i.test(text)) {
    return "Official Company";
  }

  if (/\b(statista|mckinsey|bcg|deloitte|pwc|ey|kpmg|gartner|forrester|cb insights|pitchbook|crunchbase|euromonitor|market report|industry report)\b/i.test(text)) {
    return "Market Report";
  }

  if (/\b(reuters|bloomberg|financial times|wall street journal|wsj|economist|techcrunch|forbes|cnbc|bbc|new york times)\b/i.test(text)) {
    return "Trusted News";
  }

  return "Unknown";
}

function extractPublicationDates(text: string) {
  const dates = new Set<string>();

  for (const match of text.matchAll(/\b(20[0-3]\d|19[8-9]\d)\b/g)) {
    dates.add(match[1]);
  }

  for (const match of text.matchAll(/\b(20[0-3]\d|19[8-9]\d)-([01]\d)-([0-3]\d)\b/g)) {
    dates.add(match[0]);
  }

  return [...dates].sort();
}

function parseDateYear(value: string) {
  const year = Number(value.slice(0, 4));

  return Number.isFinite(year) ? year : 0;
}

function scoreFreshness(publicationDates: string[]) {
  if (publicationDates.length === 0) {
    return 0;
  }

  const newestYear = Math.max(...publicationDates.map(parseDateYear).filter(Boolean));
  const currentYear = new Date().getUTCFullYear();
  const age = currentYear - newestYear;

  if (age <= 1) return 95;
  if (age <= 2) return 85;
  if (age <= 4) return 70;
  if (age <= 7) return 55;

  return 35;
}

function uniqueList(values: string[], limit: number) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].slice(0, limit);
}

function extractKeyFacts(reportText: string, externalData?: StructuredExternalEvidence) {
  const reportFacts = reportText
    .split(/\n|(?<=\.)\s+(?=[A-ZÇĞİÖŞÜ])/)
    .map((line) => line.trim())
    .filter((line) => /\b(verified|official|government|market|revenue|customer|growth|risk|source|doğrulanmış|resmi|pazar|gelir|müşteri|büyüme|risk|kaynak)\b/i.test(line))
    .filter((line) => line.length >= 35 && line.length <= 220);

  return uniqueList([...(externalData?.keyFacts || []), ...reportFacts], 8);
}

function extractImportantNumbers(reportText: string, externalData?: StructuredExternalEvidence) {
  const reportNumbers = [...reportText.matchAll(/(?:[$€₺]?\s?\d+(?:[.,]\d+)?\s?(?:k|m|b|%|million|billion|milyon|milyar|ay|months?)?)/gi)]
    .map((match) => match[0].replace(/\s+/g, " ").trim())
    .filter((value) => /\d/.test(value));

  return uniqueList([...(externalData?.importantNumbers || []), ...reportNumbers], 12);
}

function extractSourceList(reportText: string, externalData?: StructuredExternalEvidence) {
  const sources = new Map<string, LiveEvidenceMetadata["evidence_summary"]["sourceList"][number]>();

  for (const source of externalData?.sources || []) {
    const url = source.url?.trim() || "";
    const name = source.title?.trim() || source.publisher?.trim() || getDomain(url) || "External evidence";
    const type = classifyEvidenceSource({
      title: source.title || "",
      publisher: source.publisher || "",
      url,
      type: source.type,
    });

    sources.set(`${name}:${url}`, {
      name,
      url,
      type,
      publishedAt: source.publishedAt || "",
    });
  }

  for (const match of reportText.matchAll(/https?:\/\/[^\s),\]]+/gi)) {
    const url = match[0].replace(/[.,;:]+$/, "");
    const domain = getDomain(url);
    const type = classifyEvidenceSource({ title: domain, publisher: domain, url });

    sources.set(domain || url, {
      name: domain || url,
      url,
      type,
      publishedAt: "",
    });
  }

  return [...sources.values()].slice(0, 12);
}

export function aggregateReportEvidence(input: {
  report: Record<string, string>;
  externalData?: StructuredExternalEvidence;
}): LiveEvidenceMetadata {
  const reportText = Object.values(input.report).join("\n");
  const keyFacts = extractKeyFacts(reportText, input.externalData);
  const importantNumbers = extractImportantNumbers(reportText, input.externalData);
  const sourceList = extractSourceList(reportText, input.externalData);
  const publicationDates = uniqueList(
    [
      ...extractPublicationDates(reportText),
      ...(input.externalData?.sources || []).map((source) => source.publishedAt || ""),
    ],
    12
  );
  const distribution = emptySourceDistribution();

  for (const source of sourceList) {
    distribution[source.type] += 1;
  }

  if (sourceList.length === 0) {
    distribution.Unknown = 1;
  }

  return {
    evidence_count: keyFacts.length + importantNumbers.length + sourceList.length,
    evidence_summary: {
      keyFacts,
      importantNumbers,
      publicationDates,
      sourceList,
    },
    newest_source: publicationDates.at(-1) || "",
    oldest_source: publicationDates[0] || "",
    freshness_score: scoreFreshness(publicationDates),
    evidence_source_type_distribution: distribution,
  };
}
