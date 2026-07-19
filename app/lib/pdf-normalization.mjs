export function normalizePdfText(value) {
  return preservePdfInlineTokens(value
    .normalize("NFC")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/[ \u00a0]+/g, " ")
    .replace(/\bEScooter\b/g, "E-Scooter")
    .replace(/\bPlanning inputs narrow\b/gi, "Planning inputs define")
    .replace(/\bMarket references\b/gi, "Market sources")
    .replace(/\bSee risk section\b/gi, "Primary risk is detailed in the risk analysis")
    .replace(/\bValidate critical proof point\b/gi, "Validate the primary investment thesis")
    .replace(/\bactivationbefore\b/gi, "activation before")
    .replace(/\bwithinMarket\b/g, "within Market")
    .replace(/\bconversionbefore\b/gi, "conversion before")
    .replace(/\bAI Executive Insight:\s*AI Executive Insight:\s*/gi, "AI Executive Insight: ")
    .replace(/\bbefore committing full funding\.\s*before committing spend\b/gi, "before committing spend")
    .replace(/\b([A-Z][A-Za-z /-]{1,40}\s*[:\-–—]\s*)((?:[€$₺]?\d+(?:[.,]\d+)*\s*[kKmMbBtT%]?)(?:\s+(?:months?|days?|ay|gün))?)\s+\2\b/gi, "$1$2")
    .replace(/\b([A-Za-zÇĞİÖŞÜçğıöşü]{3,})\s+\1\b/gi, "$1")
    .replace(/(\d+)(müşteri)/gi, "$1 $2")
    .replace(/\bfiyat\s+sıkıştırma\s+by\s+yerel\s+danışmanlar\b/gi, "yerel danışmanların fiyat baskısı")
    .replace(/\b(\d+(?:[.,]\d+)?)b\b/g, "$1B")
    .replace(/([.!?])\s+\1/g, "$1")
    .replace(/\s+([,.;:)])/g, "$1")
    .replace(/(\d)\.\s+(\d)(\s*[kKmMbB%])?/g, "$1.$2$3")
    .replace(/(\d),\s+(\d{3})/g, "$1,$2")
    .replace(/\n{3,}/g, "\n\n")
    .trim());
}

const turkishPdfPresentationLabels = new Map(
  [
    ["Executive Summary", "Yönetici Özeti"],
    ["Executive Summary Preview", "Yönetici Özeti Önizlemesi"],
    ["Business Plan Report", "İş Planı Raporu"],
    ["Business Intelligence Report", "İş Zekası Raporu"],
    ["Market Analysis", "Pazar Analizi"],
    ["Market Overview", "Pazar Genel Bakışı"],
    ["Market Opportunity", "Pazar Fırsatı"],
    ["Market Opportunity Chart", "Pazar Fırsatı Grafiği"],
    ["Market Sizing Stack", "Pazar Büyüklüğü Katmanı"],
    ["TAM / SAM / SOM", "TAM / SAM / SOM"],
    ["Industry Trends", "Sektör Trendleri"],
    ["Target Customer", "Hedef Müşteri"],
    ["Target Customer / ICP", "Hedef Müşteri / ICP"],
    ["Customer Pain Points", "Müşteri Problemleri"],
    ["Competitor Analysis", "Rakip Analizi"],
    ["Competitor Landscape", "Rakip Görünümü"],
    ["Opportunities", "Fırsatlar"],
    ["Threats", "Tehditler"],
    ["SWOT Analysis", "SWOT Analizi"],
    ["Porter's Five Forces", "Porter'ın Beş Gücü"],
    ["Unit Economics", "Birim Ekonomisi"],
    ["Financial Dashboard", "Finansal Panel"],
    ["Financial Assumptions", "Finansal Varsayımlar"],
    ["Scenario Analysis: Worst / Base / Best Case", "Senaryo Analizi: Kötü / Baz / En İyi"],
    ["KPI Dashboard", "KPI Paneli"],
    ["Executive Recommendation", "Yönetici Tavsiyesi"],
    ["Entry Strategy", "Pazara Giriş Stratejisi"],
    ["Validation Plan", "Doğrulama Planı"],
    ["Founder Roadmap", "Kurucu Yol Haritası"],
    ["Key Metrics", "Temel Metrikler"],
    ["Sources / Assumptions", "Kaynaklar / Varsayımlar"],
    ["Sources", "Kaynaklar"],
    ["References", "Referanslar"],
    ["Problem", "Problem"],
    ["Solution", "Çözüm"],
    ["Business Model", "İş Modeli"],
    ["Pricing Strategy", "Fiyatlandırma Stratejisi"],
    ["Go-to-Market Plan", "Pazara Giriş Planı"],
    ["Sales Strategy", "Satış Stratejisi"],
    ["Risks", "Riskler"],
    ["KPIs", "KPI'lar"],
    ["30-60-90 Day Roadmap", "30-60-90 Günlük Yol Haritası"],
    ["AI Founder Score out of 100", "100 Üzerinden AI Kurucu Skoru"],
    ["AI Executive Insight", "AI Yönetici İçgörüsü"],
    ["Investor Insight", "Yatırımcı İçgörüsü"],
    ["Key insights", "Temel İçgörüler"],
    ["Hold for validation", "Doğrulama Beklemede"],
    ["Validation required", "Doğrulama gerekli"],
    ["VALIDATION REQUIRED", "DOĞRULAMA GEREKLİ"],
    ["Watch", "İzleme"],
    ["On track", "Yolunda"],
    ["Model target", "Model hedefi"],
    ["Model", "Model"],
    ["Score", "Skor"],
    ["Investment Score", "Yatırım Skoru"],
    ["Report Type", "Rapor Türü"],
    ["Funding Stage", "Finansman Aşaması"],
    ["Top 3 Strengths", "İlk 3 Güçlü Yön"],
    ["Top 3 Risks", "İlk 3 Risk"],
    ["AI Ready", "AI Hazır"],
    ["Investor Ready", "Yatırımcıya Hazır"],
    ["Investment Decision Snapshot", "Yatırım Kararı Özeti"],
    ["AI Investment Score", "AI Yatırım Skoru"],
    ["Market Signal", "Pazar Sinyali"],
    ["Risk Posture", "Risk Duruşu"],
    ["Decision", "Karar"],
    ["Confidence", "Güven"],
    ["Recommendation", "Tavsiye"],
    ["RECOMMENDATION", "TAVSİYE"],
    ["Next Critical Action", "Sonraki Kritik Aksiyon"],
    ["NEXT CRITICAL ACTION", "SONRAKİ KRİTİK AKSİYON"],
    ["Table of Contents", "İçindekiler"],
    ["Click a section title to jump directly to that page.", "İlgili sayfaya gitmek için bölüm başlığına tıklayın."],
    ["ZERINIX REPORT", "ZERINIX RAPORU"],
    ["ZERINIX INVESTOR INTELLIGENCE", "ZERINIX YATIRIMCI ZEKASI"],
    ["Premium AI business intelligence report for founder and investor decisions.", "Kurucu ve yatırımcı kararları için premium AI iş zekası raporu."],
    ["INVESTMENT SCORE", "YATIRIM SKORU"],
    ["EXECUTIVE SUMMARY PREVIEW", "YÖNETİCİ ÖZETİ ÖNİZLEMESİ"],
    ["Company", "Şirket"],
    ["Positioning", "Konumlandırma"],
    ["Strengths", "Güçlü Yönler"],
    ["Weaknesses", "Zayıf Yönler"],
    ["Competitive threat", "Rekabet Tehdidi"],
    ["Threat", "Tehdit"],
    ["METRIC DETAILS", "METRİK DETAYLARI"],
    ["Demand", "Talep"],
    ["Timing", "Zamanlama"],
    ["Access", "Erişim"],
    ["Defensibility", "Savunulabilirlik"],
    ["Worst", "Kötü"],
    ["Base", "Baz"],
    ["Best", "En İyi"],
    ["PASS", "GEÇ"],
    ["Reject", "Reddet"],
    ["Invest", "Yatırım Yap"],
    ["NO DATA", "VERİ YOK"],
    ["Not available", "Mevcut değil"],
  ].map(([key, value]) => [normalizePdfLocalizationKey(key), value])
);

function normalizePdfLocalizationKey(value = "") {
  return normalizePdfText(String(value))
    .replace(/\s+continued$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function detectPdfPresentationLocale(value = "") {
  const normalized = normalizePdfText(String(value));

  if (
    /[çğıöşüÇĞİÖŞÜ]/.test(normalized) ||
    /\b(?:pazar|müşteri|gelir|risk|fırsat|özet|kaynak|varsayım|doğrulama|yatırım|kurucu|rekabet|tavsiye|yönetici|iş modeli|fiyatlandırma)\b/i.test(normalized)
  ) {
    return "tr";
  }

  return "en";
}

export function localizePdfPresentationLabel(value = "", locale = "en") {
  const normalized = normalizePdfText(String(value));

  if (locale !== "tr") {
    return normalized;
  }

  const continued = /\s+continued$/i.test(normalized);
  const translated = turkishPdfPresentationLabels.get(normalizePdfLocalizationKey(normalized)) || normalized;

  return continued ? `${translated} devamı` : translated;
}

export function localizePdfPresentationText(value = "", locale = "en") {
  const normalized = normalizePdfText(String(value));

  if (locale !== "tr") {
    return normalized;
  }

  return normalized
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      const leadingWhitespace = line.match(/^\s*/)?.[0] || "";
      const bulletPrefix = trimmed.match(/^([-*•]\s+|\d+[.)]\s+)/)?.[0] || "";
      const withoutBullet = bulletPrefix ? trimmed.slice(bulletPrefix.length).trim() : trimmed;
      const headingMarker = withoutBullet.match(/^(#{1,6}\s+)/)?.[0] || "";
      const withoutHeading = headingMarker ? withoutBullet.slice(headingMarker.length).trim() : withoutBullet;
      const boldWrapped = withoutHeading.match(/^\*\*(.+)\*\*$/)?.[1];
      const labelCandidate = boldWrapped || withoutHeading;
      const directTranslation = localizePdfPresentationLabel(labelCandidate, locale);

      if (directTranslation !== labelCandidate) {
        const translated = boldWrapped ? `**${directTranslation}**` : directTranslation;
        return `${leadingWhitespace}${bulletPrefix}${headingMarker}${translated}`;
      }

      const labelMatch = labelCandidate.match(/^([^:：\-–—]{2,80})([:：\-–—])\s*(.*)$/);

      if (!labelMatch) {
        return line;
      }

      const [, rawLabel, separator, rest] = labelMatch;
      const translatedLabel = localizePdfPresentationLabel(rawLabel.trim(), locale);

      if (translatedLabel === rawLabel.trim()) {
        return line;
      }

      const rebuilt = `${translatedLabel}${separator} ${rest}`.trimEnd();
      const translated = boldWrapped ? `**${rebuilt}**` : rebuilt;
      return `${leadingWhitespace}${bulletPrefix}${headingMarker}${translated}`;
    })
    .join("\n")
    .replace(/\bAI Executive Insight\b/g, "AI Yönetici İçgörüsü")
    .replace(/\bKey insights\b/g, "Temel İçgörüler")
    .replace(/\bHold for validation\b/g, "Doğrulama Beklemede")
    .replace(/\bValidation required\b/g, "Doğrulama gerekli")
    .replace(/\bVALIDATION REQUIRED\b/g, "DOĞRULAMA GEREKLİ")
    .replace(/\bWatch\b/g, "İzleme")
    .replace(/\bOn track\b/g, "Yolunda")
    .replace(/\bModel target\b/g, "Model hedefi");
}

export function localizePdfReportSections(sections = [], locale) {
  const resolvedLocale =
    locale ||
    detectPdfPresentationLocale(
      sections.map((section) => `${section?.title || ""}\n${section?.content || ""}`).join("\n\n")
    );

  if (resolvedLocale !== "tr") {
    return sections;
  }

  return sections.map((section) => ({
    ...section,
    title: localizePdfPresentationLabel(section.title, resolvedLocale),
    content: localizePdfPresentationText(section.content, resolvedLocale),
  }));
}

export function preservePdfInlineTokens(value) {
  return value
    .replace(/([€$₺])\s+(?=\d)/g, "$1")
    .replace(/([<>])\s+([€$₺]?\d)/g, "$1$2")
    .replace(/\b(\d{1,2})\s*[-–]\s*(\d{1,2})\s*months?\b/gi, "$1–$2\u00a0months")
    .replace(/\b(\d{2})(\d{2})\s*months?\b/gi, "$1–$2\u00a0months")
    .replace(/\b100\s*[-–]\s*3\s*[-–]\s*00\s+scooters?\b/gi, "100–300\u00a0scooters")
    .replace(/\b100\s*[-–]\s*3\s*[-–]\s*00\b/g, "100–300")
    .replace(/\b1\s*[-–]\s*80\s+days?\b/gi, "180\u00a0days")
    .replace(/\b1\s*[-–]\s*80\b/g, "180")
    .replace(/\b1224\b/g, "12–24")
    .replace(/\b(\d{1,2})\s*[-–]\s*(\d{1,2})\s*days?\b/gi, "$1–$2\u00a0days")
    .replace(/\b(\d{2})(\d{2})\s*days?\b/gi, "$1–$2\u00a0days")
    .replace(/\b(\d{2})(\d{2})\s+(days?|months?|scooters?|rides\/day|rides)\b/gi, "$1–$2\u00a0$3")
    .replace(/\b(\d{3})(\d{3})\s+(scooters?|rides\/day|rides)\b/gi, "$1–$2\u00a0$3")
    .replace(/\b(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(?:rides\/day|rides)\b/gi, "$1–$2\u00a0rides/day")
    .replace(/\b(\d{1,2})\s*[-–]\s*(\d{1,2})\s*scooters?\b/gi, "$1–$2\u00a0scooters")
    .replace(/\b(\d{1,2})(\d{2})\s*%\b/g, "$1–$2%")
    .replace(/\b(\d{1,2})(\d{2})-month\b/gi, "$1–$2-month")
    .replace(/\b(\d+(?:[.,]\d+)*)\s*-\s*month\b/gi, "$1-month")
    .replace(/\b(\d{2})2month\b/gi, "$1\u00a0month")
    .replace(/\b(\d+(?:[.,]\d+)*)month\b/gi, "$1-month")
    .replace(/\b(\d+(?:[.,]\d+)*)months\b/gi, "$1\u00a0months")
    .replace(/\b(\d+(?:[.,]\d+)*)\s+month\b/gi, "$1\u00a0month")
    .replace(/\b(\d+(?:[.,]\d+)*)\s+months\b/gi, "$1\u00a0months")
    .replace(/\b(\d+)(?=(?:municipal|public|private|corporate|enterprise|customer|customers|user|users|month|months|day|days|scooter|scooters)\b)/gi, "$1 ")
    .replace(/(\d+)(?=müşteri)/gi, "$1 ")
    .replace(/\b(minimum)(?=revenue\b)/gi, "$1 ")
    .replace(/\b(public)(?=sector\b)/gi, "$1 ")
    .replace(/\b(private)(?=sector\b)/gi, "$1 ")
    .replace(/\b(last)(?=mile\b)/gi, "$1-")
    .replace(/\blast\s+mile\b/gi, "last-mile")
    .replace(/\b(third)(?=party\b)/gi, "$1-")
    .replace(/\bthird\s+party\b/gi, "third-party")
    .replace(/\b(one)(?=pager\b)/gi, "$1-")
    .replace(/\bone\s+pager\b/gi, "one-pager")
    .replace(/\b(well)(?=funded\b)/gi, "$1-")
    .replace(/\bwell\s+funded\b/gi, "well-funded")
    .replace(/\b(post)(?=\d{4}\b)/gi, "$1-")
    .replace(/(\d)\s+([kKmMbB%])\b/g, "$1$2")
    .replace(/(\d(?:[.,]\d+)*)\s*([kKmMbB])\b/g, "$1$2")
    .replace(/(\d(?:[.,]\d+)*)\s*%/g, "$1%")
    .replace(/([kKmMbB%])\s+([€$₺])/g, "$1$2")
    .replace(/([€$₺])(\d(?:[.,]\d+)*)\s*([kKmMbB])\b/g, "$1$2$3")
    .replace(/(\d+)(müşteri)/gi, "$1 $2")
    .replace(/(\d(?:[.,]\d+)*)\s+(months?|ay|gün|days?|weeks?|hafta|years?|yıl|scooters?)\b/gi, "$1\u00a0$2")
    .replace(/\bYear\s+(\d+)\b/gi, "Year\u00a0$1")
    .replace(/\bYear(\d+)\b/gi, "Year\u00a0$1")
    .replace(/\bMonth\s+(\d+)\b/gi, "Month\u00a0$1")
    .replace(/\bMonth(\d+)\b/gi, "Month\u00a0$1")
    .replace(/\(e\.\s*,/gi, "(e.g.,")
    .replace(/\be\.\s*,/gi, "e.g.,")
    .replace(/\bi\.\s*,/gi, "i.e.,")
    .replace(/\be\.\s*g\./gi, "e.g.")
    .replace(/\bi\.\s*e\./gi, "i.e.")
    .replace(/\bv\.\s*s\./gi, "vs.")
    .replace(/\bN\.\s*o\./g, "No.")
    .replace(/\bM\.\s*r\./g, "Mr.")
    .replace(/\bD\.\s*r\./g, "Dr.")
    .replace(/\betc\./gi, "etc.")
    .replace(/\b(e\.g\.|i\.e\.|vs\.|etc\.|No\.|Mr\.|Dr\.)\s+(?=\S)/g, "$1\u00a0")
    .replace(/\bU\.\s*S\./gi, "U.S.")
    .replace(/\bE\.\s*U\./gi, "E.U.")
    .replace(/\bB\s*2\s*B\b/gi, "B2B")
    .replace(/\bB\s*2\s*G\b/gi, "B2G")
    .replace(/\bA\s*R\s*P\s*A\b/gi, "ARPA")
    .replace(/\bC\s*A\s*C\b/gi, "CAC")
    .replace(/\bL\s*T\s*V\b/gi, "LTV")
    .replace(/\bE\s*B\s*I\s*T\s*D\s*A\b/gi, "EBITDA")
    .replace(/(\d)\.\s*(\d)/g, "$1.$2")
    .replace(/(\d),\s*(\d{3})/g, "$1,$2");
}

export function cleanPdfContinuationFragment(value) {
  return preservePdfInlineTokens(value.trim().replace(/^[-*•]\s*/, ""));
}

export function shouldJoinPdfLineFragment(previousLine, currentLine) {
  const previous = previousLine.trim();
  const current = cleanPdfContinuationFragment(currentLine);

  if (!previous || !current) {
    return false;
  }

  return (
    /(?:[€$₺]?\d+(?:[.,]\d+)*[.,]|[€$₺]?\d+)$/.test(previous) &&
      /^(?:\d+(?:[.,]\d+)?(?:[kKmMbB%])?|[kKmMbB%]|months?|days?|ay|gün|scooters?)\b/i.test(current)
  ) || (
    /\b(?:e|i|v|N|M|D)\.$/.test(previous) && /^(?:g|e|s|o|r)\.$/i.test(current)
  ) || (
    /(?:\(|\b)(?:e|i)\.$/i.test(previous) && /^,\s*\S/.test(current)
  ) || (
    /\b(?:e\.g\.|i\.e\.|vs\.|etc\.|No\.|Mr\.|Dr\.)$/i.test(previous) && /^[.,)]$/.test(current)
  ) || (
    /[€$₺(]$/.test(previous) && /^\d/.test(current)
  ) || (
    /[a-zçğıöşü]$/i.test(previous) && /^(?:municipal|permit|sector|revenue|market|customer|customers|user|users|month|months|scooters?|pilot|validation)\b/i.test(current)
  ) || (
    !/[.!?:;)]$/.test(previous) && /^(?:mile|funded|revenue|sector|pager|party|month|months|pilot|validation|\d{1,3})$/i.test(current)
  ) || /^[.,)]$/.test(current);
}

export function joinPdfLineFragment(previousLine, currentLine) {
  const current = cleanPdfContinuationFragment(currentLine);

  if (/(?:\(|\b)e\.$/i.test(previousLine.trim()) && /^,\s*\S/.test(current)) {
    return preservePdfInlineTokens(`${previousLine.trimEnd()}g.${current}`);
  }

  if (/(?:\(|\b)i\.$/i.test(previousLine.trim()) && /^,\s*\S/.test(current)) {
    return preservePdfInlineTokens(`${previousLine.trimEnd()}e.${current}`);
  }

  const separator =
    /(?:[€$₺]?\d+(?:[.,]\d+)*[.,]|[€$₺(]|\b(?:e|i|v|N|M|D)\.)$/i.test(previousLine.trim()) ||
    /^[.,)]/.test(current)
      ? ""
      : " ";

  return preservePdfInlineTokens(`${previousLine.trimEnd()}${separator}${current}`);
}

export function repairPdfLineFragments(lines, isOrphanBulletText = () => false) {
  return lines.reduce((repaired, line) => {
    const withoutBullet = cleanPdfContinuationFragment(line);

    if (repaired.length > 0 && shouldJoinPdfLineFragment(repaired[repaired.length - 1], line)) {
      repaired[repaired.length - 1] = joinPdfLineFragment(repaired[repaired.length - 1], line);
      return repaired;
    }

    if (isOrphanBulletText(withoutBullet)) {
      return repaired;
    }

    if (repaired[repaired.length - 1]?.trim() === line.trim()) {
      return repaired;
    }

    repaired.push(line);
    return repaired;
  }, []);
}

export function normalizePdfSourceDomain(value = "") {
  const rawValue = normalizePdfText(String(value));
  if (isUnverifiedPdfSourceUrl(rawValue)) {
    return "";
  }

  const urlMatch =
    rawValue.match(/\]\((https?:\/\/[^)]+)\)/i)?.[1] ||
    rawValue.match(/\bhttps?:\/\/[^\s)]+/i)?.[0] ||
    rawValue;
  if (isUnverifiedPdfSourceUrl(urlMatch)) {
    return "";
  }

  let domain = "";

  try {
    domain = new URL(urlMatch).hostname;
  } catch {
    domain = urlMatch;
  }

  domain = domain
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/g, "")
    .replace(/^(?:\d+\.)+(?=[a-z])/i, "")
    .replace(/[^a-z0-9.ığüşöçİĞÜŞÖÇ-]+/gi, ".")
    .replace(/^\.+|\.+$/g, "");

  if (/\beuromonitor\b/i.test(domain)) {
    return "euromonitor.international";
  }

  return domain;
}

function isUnverifiedPdfSourceUrl(value = "") {
  const normalized = normalizePdfText(String(value)).trim();

  return (
    !normalized ||
    /^[-–—]+$/.test(normalized) ||
    /^(?:not verified|url doğrulanmadı|n\/?a|not available|none|null|undefined)$/i.test(normalized)
  );
}

function normalizePdfSourceLine(line = "") {
  const normalized = normalizePdfText(String(line)).trim();
  const urlMatch = normalized.match(/^(url)\s*[:\-–—]\s*(.*)$/i);

  if (urlMatch && isUnverifiedPdfSourceUrl(urlMatch[2])) {
    return "URL: Not verified";
  }

  return normalized;
}

function normalizePdfSourceKeyText(value = "") {
  return normalizePdfText(String(value))
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gi, "$1")
    .replace(/\bhttps?:\/\/[^\s)]+/gi, "")
    .replace(/^(?:[-*•]|\d+[.)])\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/\b(title|source|publisher|organization|year|publication year|url|confidence|source type|type)\s*[:\-–—]\s*/gi, " ")
    .replace(/[^a-z0-9ığüşöçİĞÜŞÖÇ]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getPdfSourceBlockKey(block) {
  const normalized = normalizePdfText(block);
  const url =
    normalized.match(/^(?:[-*•]\s*)?url\s*[:\-–—]\s*(.+)$/im)?.[1] ||
    normalized.match(/\]\((https?:\/\/[^)]+)\)/i)?.[1] ||
    normalized.match(/\bhttps?:\/\/[^\s)]+/i)?.[0] ||
    "";
  const domain = normalizePdfSourceDomain(url);
  const title =
    normalized.match(/^(?:[-*•]\s*)?(?:title|source)\s*[:\-–—]\s*(.+)$/im)?.[1] ||
    normalized.match(/^(?:[-*•]\s*)?[^—–|-]{2,80}\s*[—–-]\s*(.+?)(?:\s*\(\d{4}\))?\s*$/m)?.[1] ||
    "";
  const publisher =
    normalized.match(/^(?:[-*•]\s*)?(?:publisher|organization)\s*[:\-–—]\s*(.+)$/im)?.[1] ||
    normalized.match(/^(?:[-*•]\s*)?([^—–|-]{2,80})\s*[—–-]\s*.+$/m)?.[1] ||
    "";
  const titleKey = normalizePdfSourceKeyText(title);
  const publisherKey = normalizePdfSourceKeyText(publisher);
  const blockKey = normalizePdfSourceKeyText(normalized);
  const domainNameKey = normalizePdfSourceKeyText(domain.split(".")[0] || "");

  if (
    domain &&
    domainNameKey &&
    (titleKey === domainNameKey ||
      publisherKey === domainNameKey ||
      titleKey.startsWith(`${domainNameKey} `) ||
      publisherKey.startsWith(`${domainNameKey} `))
  ) {
    return `domain:${domain}`;
  }

  if (domain && titleKey) {
    return `domain-title:${domain}|${titleKey}`;
  }

  if (publisherKey && titleKey) {
    return `publisher-title:${publisherKey}|${titleKey}`;
  }

  if (domain) {
    return `domain:${domain}`;
  }

  return `text:${blockKey}`;
}

export function normalizePdfSourceContent(content = "") {
  const blocks = [];
  let currentBlock = [];

  const flushBlock = () => {
    const block = currentBlock.join("\n").trim();

    if (block) {
      blocks.push(block);
    }

    currentBlock = [];
  };

  normalizePdfText(String(content))
    .split("\n")
    .map((line) => line.trim())
    .forEach((line) => {
      if (!line) {
        flushBlock();
        return;
      }

      const startsSourceBlock =
        /^(?:[-*•]|\d+[.)])?\s*(?:title|source|publisher|organization)\s*[:\-–—]\s*\S/i.test(line) ||
        /^(?:[-*•]|\d+[.)])\s+\S.{12,}/.test(line) ||
        /^(?:[-*•]\s*)?[^—–|-]{2,80}\s*[—–-]\s*.+/.test(line);

      if (startsSourceBlock && currentBlock.length > 0) {
        flushBlock();
      }

      currentBlock.push(line);
    });

  flushBlock();

  const seen = new Set();

  return blocks
    .map((block) =>
      block
        .split("\n")
        .map((line) => normalizePdfSourceLine(line.replace(/^\s*\d+[.)]\s+/, "").trim()))
        .filter(Boolean)
        .join("\n")
    )
    .filter((block) => {
      const key = getPdfSourceBlockKey(block);

      if (!key || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizePdfTamSamSomOwnershipContent(content = "", section = {}) {
  const field = typeof section.field === "string" ? section.field.toLowerCase() : "";
  const title = typeof section.title === "string" ? section.title.toLowerCase() : "";

  if (
    field === "tamsamsom" ||
    /\btam\b[\s/|,·-]*\bsam\b[\s/|,·-]*\bsom\b/i.test(title) ||
    /^(sources|references|kaynaklar|sources \/ assumptions|kaynaklar \/ varsayımlar)$/i.test(title)
  ) {
    return normalizePdfText(String(content));
  }

  return normalizePdfText(String(content))
    .split("\n")
    .filter((line) => {
      const normalized = line.replace(/^[-*•]\s*/, "").trim();

      if (!normalized) {
        return true;
      }

      return !(
        /^(?:tam|sam|som)\s*[:\-–—]/i.test(normalized) ||
        /\btam\s*\/\s*sam\s*\/\s*som\b/i.test(normalized) ||
        /\b(?:tam|sam|som)\b.+(?:[€$₺]?\d+(?:[.,]\d+)*\s*[kKmMbBtT%]?|\d+\s*%)/i.test(normalized) ||
        /\bmarket sizing\s*[:\-–—]/i.test(normalized)
      );
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizePdfCanonicalTamSamSomContent(content = "") {
  const seenLabels = new Set();

  return normalizePdfText(String(content))
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      const normalized = line.replace(/^[-*•]\s*/, "").trim();
      const labelMatch = normalized.match(/^(tam|sam|som)\s*[:\-–—]/i);

      if (labelMatch) {
        const label = labelMatch[1].toLowerCase();

        if (seenLabels.has(label)) {
          return false;
        }

        seenLabels.add(label);
        return true;
      }

      return !(
        /\btam\s*\/\s*sam\s*\/\s*som\b/i.test(normalized) ||
        /\bmarket sizing\s*[:\-–—]/i.test(normalized)
      );
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function normalizePdfTamSamSomBodyContent(content = "") {
  let yorum = "";
  let insight = "";
  let captureInsight = false;

  normalizePdfText(String(content))
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const normalized = line.replace(/^[-*•]\s*/, "").trim();

      if (
        /^(?:tam|sam|som)\s*[:\-–—]/i.test(normalized) ||
        /\btam\s*\/\s*sam\s*\/\s*som\b/i.test(normalized) ||
        /\bmarket sizing\s*[:\-–—]/i.test(normalized)
      ) {
        captureInsight = false;
        return;
      }

      const yorumMatch = normalized.match(/^(yorum|interpretation|commentary)\s*[:\-–—]\s*(.+)$/i);

      if (!yorum && yorumMatch?.[2]) {
        yorum = `Yorum: ${yorumMatch[2].trim()}`;
        captureInsight = false;
        return;
      }

      const insightMatch = normalized.match(/^(?:ai\s+)?executive insight\s*[:\-–—]\s*(.*)$/i);

      if (!insight && insightMatch) {
        insight = insightMatch[1]?.trim()
          ? `AI Executive Insight: ${insightMatch[1].trim()}`
          : "AI Executive Insight:";
        captureInsight = !insightMatch[1]?.trim();
        return;
      }

      if (captureInsight && !insight.replace(/^AI Executive Insight:\s*/i, "").trim()) {
        insight = `AI Executive Insight: ${normalized}`;
        captureInsight = false;
      }
    });

  return [yorum, insight]
    .filter(Boolean)
    .join("\n")
    .replace(/\bAI Executive Insight:\s*AI Executive Insight:\s*/gi, "AI Executive Insight: ")
    .replace(/\b([A-Za-zÇĞİÖŞÜçğıöşü]{3,})\s+\1\b/gi, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const unitEconomicsMetricLabels = [
  "ARPA",
  "ACV",
  "Average Revenue per Account",
  "Average Contract Value",
  "CAC",
  "Customer Acquisition Cost",
  "LTV",
  "Lifetime Value",
  "LTV:CAC",
  "LTV / CAC",
  "Payback",
  "Payback Period",
  "CAC Payback",
  "Gross Margin",
  "Margin",
];

const financialDashboardMetricLabels = [
  "ARR",
  "Annual Recurring Revenue",
  "MRR",
  "Monthly Recurring Revenue",
  "Revenue",
  "Monthly Revenue",
  "Yearly Revenue",
  "Annual Revenue",
  "Expenses",
  "Burn",
  "Burn Rate",
  "Monthly Burn",
  "Runway",
  "EBITDA",
  "Break-even",
  "Break-even Month",
  "Break even Month",
  "Breakeven",
  "Investment Needed",
];

const allFinancialMetricLabels = [
  ...unitEconomicsMetricLabels,
  ...financialDashboardMetricLabels,
];

function escapePdfRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasPdfOwnedFinancialMetricLine(line, labels) {
  const trimmed = normalizePdfText(String(line))
    .replace(/^[-*•]\s*/, "")
    .replace(/^\d+[.)]\s*/, "")
    .trim();

  if (!trimmed) {
    return false;
  }

  return labels.some((label) => {
    const escapedLabel = escapePdfRegex(label);

    return new RegExp(
      `^${escapedLabel}\\s*[:\\-–—]\\s*(?:[€$₺]?\\d|\\d|—|-|\\$|formula\\b|assumptions?\\b|confidence\\b|benchmark\\b)`,
      "i"
    ).test(trimmed);
  });
}

function dedupeRepeatedPdfPercentageTokens(content = "") {
  return normalizePdfText(String(content)).replace(
    /\b([A-Za-zÇĞİÖŞÜçğıöşü][A-Za-zÇĞİÖŞÜçğıöşü /-]{1,80}\s*[:\-–—]?\s*)(\d{1,3}(?:[.,]\d+)?%)((?:\s+\2){1,})(?=\s|[.,;)]|$)/gi,
    "$1$2"
  );
}

export function normalizePdfFinancialSectionContent(content = "", section = {}) {
  const field = typeof section.field === "string" ? section.field.toLowerCase() : "";
  const title = typeof section.title === "string" ? section.title.toLowerCase() : "";

  if (field === "financialdashboard" || title.includes("financial dashboard")) {
    return "";
  }

  if (field === "uniteconomics" || title.includes("unit economics")) {
    return dedupeRepeatedPdfPercentageTokens(content)
      .split("\n")
      .filter((line) => !hasPdfOwnedFinancialMetricLine(line, unitEconomicsMetricLabels))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  if (
    field === "executiverecommendation" ||
    field === "sourcesassumptions" ||
    title.includes("executive recommendation") ||
    title.includes("sources / assumptions")
  ) {
    return dedupeRepeatedPdfPercentageTokens(content)
      .split("\n")
      .filter((line) => !hasPdfOwnedFinancialMetricLine(line, allFinancialMetricLabels))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  return dedupeRepeatedPdfPercentageTokens(content);
}
