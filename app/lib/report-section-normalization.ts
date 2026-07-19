type ReportSectionLike = {
  field?: string;
  title: string;
  content: string;
};

function normalizeSectionText(value: string) {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

function isTamSamSomSection(section: ReportSectionLike) {
  return (
    section.field === "tamSamSom" ||
    /\btam\b[\s/|,.-]*\bsam\b[\s/|,.-]*\bsom\b/i.test(section.title)
  );
}

function isLegacyTamSamSomDuplicateSection(section: ReportSectionLike) {
  if (isTamSamSomSection(section)) {
    return false;
  }

  const title = normalizeSectionText(section.title);
  const content = normalizeSectionText(section.content);
  const combined = `${title}\n${content}`;
  const titleContainsSizingTerm = /\b(?:tam|sam|som)\b/i.test(title);
  const contentContainsSizingMetric = /^(?:[-*•]\s*)?(?:tam|sam|som)\s*[:\-–—]/im.test(
    section.content
  );
  const contentContainsSizingInsight =
    /\b(?:ai\s+)?executive insight\b/i.test(content) &&
    /\b(?:tam|sam|som|market sizing|market size)\b/i.test(combined);

  return titleContainsSizingTerm || contentContainsSizingMetric || contentContainsSizingInsight;
}

function sectionFingerprint(section: ReportSectionLike) {
  return `${normalizeSectionText(section.title).toLowerCase()}::${normalizeSectionText(section.content).toLowerCase()}`;
}

export function dedupeReportSections<T extends ReportSectionLike>(sections: T[]) {
  const canonicalTamSamSomIndex = sections.findIndex(isTamSamSomSection);
  const seenFingerprints = new Set<string>();
  let keptTamSamSom = false;

  return sections.filter((section, index) => {
    const fingerprint = sectionFingerprint(section);

    if (seenFingerprints.has(fingerprint)) {
      return false;
    }

    if (canonicalTamSamSomIndex !== -1 && isTamSamSomSection(section)) {
      if (keptTamSamSom) {
        return false;
      }

      keptTamSamSom = true;
      seenFingerprints.add(fingerprint);
      return true;
    }

    if (
      canonicalTamSamSomIndex !== -1 &&
      index > canonicalTamSamSomIndex &&
      isLegacyTamSamSomDuplicateSection(section)
    ) {
      return false;
    }

    seenFingerprints.add(fingerprint);
    return true;
  });
}
