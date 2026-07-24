export function formatMetricCardValue(value: string) {
  const cleanValue = value.trim().replace(/\*\*/g, "");

  if (!cleanValue) {
    return "";
  }

  return cleanValue
    .split(/\b(?:formula|assumptions?|varsayımlar|confidence|güven|evidence|validation evidence|validation needed|metadata|referans|benchmark(?: source| comparison)?|raw benchmark context|explanation|justification|source)\b\s*[:\-–—=]/i)[0]
    .split(/\s+(?:based on|using|assuming|calculated from|derived from)\s+/i)[0]
    .split(/\s*[;|]\s*/)[0]
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/(\d)\.\s+(\d)(\s*[kKmMbB%])?/g, "$1.$2$3")
    .replace(/(\d),\s+(\d{3})/g, "$1,$2")
    .trim();
}

export function cleanEvidenceMetadataForDisplay(content: string) {
  return content
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();

      return !/^(?:[-*•]\s*)?(?:formula|assumptions?|varsayımlar|confidence|güven|evidence|validation evidence|validation needed|metadata|referans|raw validation context|raw benchmark context|internal evidence keys?|benchmark(?:source| source| comparison)?)\s*[:=]/i.test(trimmed);
    })
    .map((line) =>
      line
        .replace(/\s*\|\s*(?:formula|assumptions?|varsayımlar|confidence|güven|evidence|validation evidence|validation needed|metadata|referans|raw validation context|raw benchmark context|internal evidence keys?|benchmark(?:source| source| comparison)?)\s*[:=][^|\n]+/gi, "")
        .replace(/\b(?:formula|assumptions?|varsayımlar|confidence|güven|evidence|validation evidence|validation needed|metadata|referans|raw validation context|raw benchmark context|internal evidence keys?|benchmarkSource|benchmark)\s*=\s*[^|;\n]+/gi, "")
        .replace(/\bplanning assumptions require validation\b[.;]?/gi, "")
        .trimEnd()
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function cleanExecutiveText(
  value: string,
  maxLength = 180,
  normalizeText: (content: string) => string = (content) => content
) {
  const cleaned = normalizeText(value)
    .replace(/^[-*•]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .replace(/^#+\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/\s*\|\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const truncated = cleaned.slice(0, maxLength).replace(/\s+\S*$/, "");

  return `${truncated || cleaned.slice(0, maxLength)}…`;
}

export function extractMeaningfulBullets(
  content: string,
  limit = 4,
  options: {
    normalizeText?: (content: string) => string;
    isOrphanBulletText?: (value: string) => boolean;
  } = {}
) {
  const normalizeText = options.normalizeText || ((value: string) => value);
  const isOrphanText = options.isOrphanBulletText || (() => false);
  const normalized = normalizeText(content);
  const bulletLines = normalized
    .split("\n")
    .map((line) => line.trim())
    .map((line) =>
      line
        .trim()
        .replace(/^[-*•]\s+/, "")
        .replace(/^\d+[.)]\s+/, "")
        .replace(/\*\*/g, "")
        .trim()
    )
    .filter((line) => line.length > 16 && !isOrphanText(line));

  if (bulletLines.length) {
    return bulletLines.slice(0, limit).map((line) => cleanExecutiveText(line, 150, normalizeText));
  }

  return normalized
    .replace(/\*\*/g, "")
    .split(/(?<=[.!?])\s+/)
    .map((line) => cleanExecutiveText(line, 150, normalizeText))
    .filter((line) => line.length > 16 && !isOrphanText(line))
    .slice(0, limit);
}
