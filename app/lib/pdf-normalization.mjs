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
    .replace(/\bsources(?:\.[a-z0-9_-]+)+\b/gi, "Source category: Planning assumption. External citation metadata was not provided.")
    .replace(/\bdeduplicated\.none\.provided\.by\.user\b/gi, "Source category: Planning assumption. External citation metadata was not provided.")
    .replace(/\bnone\.provided\.by\.user\b/gi, "Source category: Planning assumption. External citation metadata was not provided.")
    .replace(/\bomitted\.unverifiable\.third(?:\.[a-z0-9_-]+)*\b/gi, "Source category: Planning assumption. External citation metadata was not provided.")
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

const pdfPresentationLabelPairs = [
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
    ["Worst Case", "Kötü Senaryo"],
    ["Base Case", "Baz Senaryo"],
    ["Best Case", "En İyi Senaryo"],
    ["KPI Dashboard", "KPI Paneli"],
    ["Executive Recommendation", "Yönetici Tavsiyesi"],
    ["Entry Strategy", "Pazara Giriş Stratejisi"],
    ["Validation Plan", "Doğrulama Planı"],
    ["Founder Roadmap", "Kurucu Yol Haritası"],
    ["Tomorrow", "Yarın"],
    ["This Week", "Bu Hafta"],
    ["30 Days", "30 Gün"],
    ["90 Days", "90 Gün"],
    ["180 Days", "180 Gün"],
    ["12 Months", "12 Ay"],
    ["Next 30 Days", "Sonraki 30 Gün"],
    ["Next 90 Days", "Sonraki 90 Gün"],
    ["Next 6 months", "Sonraki 6 Ay"],
    ["Next 12 months", "Sonraki 12 Ay"],
    ["Key Metrics", "Temel Metrikler"],
    ["Sources / Assumptions", "Kaynaklar / Varsayımlar"],
    ["Sources", "Kaynaklar"],
    ["References", "Referanslar"],
    ["Methodology & Assumptions", "Metodoloji ve Varsayımlar"],
    ["Market sizing, financial projections and KPI estimates are based on available market signals, benchmark data and planning assumptions.", "Pazar büyüklüğü, finansal projeksiyonlar ve KPI tahminleri mevcut pazar sinyalleri, benchmark verileri ve planlama varsayımlarına dayanır."],
    ["Market benchmarks", "Pazar Karşılaştırmaları"],
    ["Market Comparisons", "Pazar Karşılaştırmaları"],
    ["Financial benchmarks", "Finansal Karşılaştırmalar"],
    ["Financial Comparisons", "Finansal Karşılaştırmalar"],
    ["Planning assumptions", "Planlama Varsayımları"],
    ["Planning Assumptions", "Planlama Varsayımları"],
    ["Type: Industry benchmark", "Tür: Sektör benchmarkı"],
    ["Type: Financial benchmark / planning assumption", "Tür: Finansal benchmark / planlama varsayımı"],
    ["Type: Model assumption", "Tür: Model varsayımı"],
    ["Type: Primary research required", "Tür: Birincil araştırma gerekli"],
    ["Verified source", "Doğrulanmış kaynak"],
    ["Company reference", "Şirket referansı"],
    ["Industry reference", "Sektör referansı"],
    ["Planning assumption", "Planlama varsayımı"],
    ["Planning Assumption", "Planlama Varsayımı"],
    ["Reference", "Referans"],
    ["Source type", "Kaynak türü"],
    ["Trust label", "Güven etiketi"],
    ["Source name", "Kaynak adı"],
    ["Not verified", "Doğrulanmadı"],
    ["URL not verified", "URL doğrulanmadı"],
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
    ["Founder Score", "AI Kurucu Skoru"],
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
    ["Decision Confidence", "Karar Güveni"],
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
    ["INVESTMENT RECOMMENDATION", "YATIRIM TAVSİYESİ"],
    ["EXECUTIVE SUMMARY PREVIEW", "YÖNETİCİ ÖZETİ ÖNİZLEMESİ"],
    ["Company", "Şirket"],
    ["Positioning", "Konumlandırma"],
    ["Strengths", "Güçlü Yönler"],
    ["Weaknesses", "Zayıf Yönler"],
    ["Competitive threat", "Rekabet Tehdidi"],
    ["Threat", "Tehdit"],
    ["METRIC DETAILS", "METRİK DETAYLARI"],
    ["ARR", "ARR"],
    ["MRR", "MRR"],
    ["Revenue", "Gelir"],
    ["Gross Margin", "Brüt Marj"],
    ["Burn Rate", "Nakit Yakımı"],
    ["Runway", "Finansal Pist"],
    ["Payback", "Geri Ödeme"],
    ["Break-even", "Başabaş"],
    ["Target", "Hedef"],
    ["Status", "Durum"],
    ["Owner", "Sahip"],
    ["Trigger", "Tetikleyici"],
    ["Action", "Aksiyon"],
    ["Validation needed", "Gerekli doğrulama"],
    ["Monitor actuals", "Gerçekleşenleri izle"],
    ["Validate with operating data", "Operasyon verisiyle doğrula"],
    ["Confirm planning input", "Planlama girdisini doğrula"],
    ["Acquisition", "Edinim"],
    ["Activation", "Aktivasyon"],
    ["Retention", "Elde Tutma"],
    ["WTP", "Ödeme İsteği"],
    ["Sales cycle", "Satış Döngüsü"],
    ["Conversion", "Dönüşüm"],
    ["Model Based", "Model Tabanlı"],
    ["Model Estimate", "Model Tahmini"],
    ["Benchmark-derived", "Benchmark Tabanlı"],
    ["Food & Beverage / Specialty Coffee", "Yiyecek & İçecek / Özel Kahve"],
    ["D2C Brand + Subscription + B2B", "D2C Marka + Abonelik + B2B"],
    ["Specialty coffee and premium food & beverage benchmarks adjusted...", "Özel kahve ve premium yiyecek-içecek benchmarklarına göre düzenlenmiştir."],
    ["market size and contribution margin assumptions", "pazar büyüklüğü ve katkı marjı varsayımları"],
    ["Run primary research to validate market size...", "Pazar büyüklüğü ve katkı marjı varsayımlarını doğrulamak için birincil araştırma yapın."],
    ["Run primary research to validate market size and contribution margin assumptions.", "Pazar büyüklüğü ve katkı marjı varsayımlarını doğrulamak için birincil araştırma yapın."],
    ["D2C unit sales, recurring subscriptions, and B2B wholesale accounts", "D2C ürün satışları, tekrar eden abonelikler ve B2B toptan hesaplar"],
    ["Execution risk", "Yürütme Riski"],
    ["Planning Assumption", "Planlama Varsayımı"],
    ["Validation Required", "Doğrulama Gerekli"],
    ["Verified", "Doğrulanmış"],
    ["Demand", "Talep"],
    ["Timing", "Zamanlama"],
    ["Access", "Erişim"],
    ["Defensibility", "Savunulabilirlik"],
    ["Worst", "Kötü"],
    ["Base", "Baz"],
    ["Best", "En İyi"],
    ["PASS", "GEÇ"],
    ["HOLD", "BEKLE"],
    ["VALIDATE", "DOĞRULA"],
    ["REJECT", "REDDET"],
    ["Reject", "Reddet"],
    ["Invest", "Yatırım Yap"],
    ["Rivalry", "Rekabet Yoğunluğu"],
    ["Entrants", "Yeni Girişler"],
    ["Buyer", "Alıcı"],
    ["Supplier", "Tedarikçi"],
    ["Substitutes", "İkameler"],
    ["NO DATA", "VERİ YOK"],
    ["Not available", "Mevcut değil"],
];

const turkishPdfPresentationLabels = new Map(
  pdfPresentationLabelPairs.map(([key, value]) => [
    normalizePdfLocalizationKey(key),
    value,
  ])
);

const englishPdfPresentationLabels = new Map(
  pdfPresentationLabelPairs.map(([key, value]) => [
    normalizePdfLocalizationKey(value),
    key,
  ])
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
  const continued = /\s+continued$/i.test(normalized);
  const devam = /\s+devamı$/i.test(normalized);
  const key = normalizePdfLocalizationKey(normalized.replace(/\s+devamı$/i, ""));
  const translated =
    locale === "tr"
      ? turkishPdfPresentationLabels.get(key) || normalized.replace(/\s+continued$/i, "")
      : englishPdfPresentationLabels.get(key) || normalized.replace(/\s+devamı$/i, "");

  if (locale === "tr") {
    return continued || devam ? `${translated} devamı` : translated;
  }

  return continued || devam ? `${translated} continued` : translated;
}

export function localizePdfPresentationText(value = "", locale = "en") {
  const normalized = normalizePdfText(String(value));

  const localized = normalized
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
    .join("\n");

  if (locale === "tr") {
    return localized
      .replace(/\bSource category: Planning assumption\. External citation metadata was not provided\./g, "Kaynak kategorisi: Planlama varsayımı. Harici kaynak metadatası sağlanmadı.")
      .replace(/\bAI Executive Insight\b/g, "AI Yönetici İçgörüsü")
      .replace(/\bKey insights\b/g, "Temel İçgörüler")
      .replace(/\bHold for validation\b/g, "Doğrulama Beklemede")
      .replace(/\bValidation required\b/g, "Doğrulama gerekli")
      .replace(/\bVALIDATION REQUIRED\b/g, "DOĞRULAMA GEREKLİ")
      .replace(/\bFood & Beverage \/ Specialty Coffee\b/g, "Yiyecek & İçecek / Özel Kahve")
      .replace(/\bD2C Brand \+ Subscription \+ B2B\b/g, "D2C Marka + Abonelik + B2B")
      .replace(/\bpremium coffee consumers, office buyers, boutique HoReCa accounts\b/gi, "premium kahve tüketicileri, ofis alıcıları ve butik HoReCa hesapları")
      .replace(/\bSpecialty coffee and premium food & beverage benchmarks adjusted(?:[^.\n]*\.)?/gi, "Özel kahve ve premium yiyecek-içecek benchmarklarına göre düzenlenmiştir.")
      .replace(/\bmarket size and contribution margin assumptions\b/gi, "pazar büyüklüğü ve katkı marjı varsayımları")
      .replace(/\bCapital efficiency is based on\s+([^.\n]+)\./gi, "Sermaye verimliliği $1 temel alınarak değerlendirilmiştir.")
      .replace(/\bCapital efficiency improves when\s+([^.\n]+)\./gi, "Sermaye verimliliği $1 gerçekleştiğinde iyileşir.")
      .replace(/\bCapital efficiency:\s*investment need is \$3\.6M against \$768k Year-1 ARR\./gi, "Sermaye verimliliği: $3.6M yatırım ihtiyacına karşılık 1. yıl ARR hedefi $768k.")
      .replace(/\binvestment need is \$3\.6M against \$768k Year-1 ARR\b/gi, "Sermaye verimliliği: $3.6M yatırım ihtiyacına karşılık 1. yıl ARR hedefi $768k.")
      .replace(/\bopportunity is supported by reachable demand\b/gi, "fırsat, erişilebilir talep tarafından desteklenmektedir")
      .replace(/\bRevenue\s+\$768k\s+base falls[^.\n]*(?:\.[^\n]*)?/gi, "Baz senaryoda $768k gelir, doğrulama ve katkı marjı varsayımları güçlenene kadar baskı altında kalabilir.")
      .replace(/\bobtainable market wedge, and benchmark growth potential\b/gi, "erişilebilir pazar payı ve benchmark büyüme potansiyeli")
      .replace(/\bcompetitive advantage needs stronger moat proof\b/gi, "rekabet avantajı daha güçlü savunulabilirlik kanıtı gerektirir")
      .replace(/\bmargin, EBITDA profile\b/gi, "marj ve EBITDA profili")
      .replace(/\bEarly Warning\b/g, "Erken Uyarı")
      .replace(/\bcustomer metrics\b/gi, "müşteri metrikleri")
      .replace(/\bassumptions require primary validation\b/gi, "varsayımlar birincil doğrulama gerektirir")
      .replace(/\bmargin and EBITDA profile\b/gi, "marj ve EBITDA profili")
      .replace(/\bbreak-even timing\b/gi, "başabaş zamanlaması")
      .replace(/\bTechnology leverage reflects technical intensity[^.\n]*(?:\.[^\n]*)?/gi, "Teknoloji kaldıraç etkisi, teknik yoğunluk, savunulabilirlik sinyalleri ve marj genişleme potansiyelini yansıtır.")
      .replace(/\b(?:Execution risk|Yürütme Riski)\s+is healthier when payback[^.\n]*(?:\.[^\n]*)?/gi, "Yürütme Riski, geri ödeme ve başabaş zamanlaması gerçekçi olduğunda, kanıt seviyesi güçlendiğinde ve operasyonel karmaşıklık azaldığında daha yönetilebilir hale gelir.")
      .replace(/\bFinancial health is based on\s+([^.\n]+)\./gi, "Finansal sağlık $1 temel alınarak değerlendirilmiştir.")
      .replace(/\b3\.6 months\b/g, "3,6 ay")
      .replace(/\b3\.6 ay\b/g, "3,6 ay")
      .replace(/\$162k\/month\b/g, "$162k/ay")
      .replace(/\b22 months\b/g, "22 ay")
      .replace(/\b(\d+(?:[.,]\d+)?)\s+months\b/gi, "$1 ay")
      .replace(/\bMonth\s+48\b/g, "48. Ay")
      .replace(/\bRevenue\b/g, "Gelir")
      .replace(/\bBurn Rate\b/g, "Nakit Yakımı")
      .replace(/\bMonthly Burn\b/g, "Aylık Nakit Yakımı")
      .replace(/\bBurn\b/g, "Nakit Yakımı")
      .replace(/\brunway\b/gi, "Finansal Pist")
      .replace(/\bconfidence is Low\b/gi, "güven seviyesi Düşük")
      .replace(/\baktivasyonukanıtla\b/gi, "aktivasyonu kanıtla")
      .replace(/\bdönüşümekadar\b/gi, "dönüşüme kadar")
      .replace(/\bTomorrow\b/g, "Yarın")
      .replace(/\bThis Week\b/g, "Bu Hafta")
      .replace(/\b30 Days\b/g, "30 Gün")
      .replace(/\b90 Days\b/g, "90 Gün")
      .replace(/\b180 Days\b/g, "180 Gün")
      .replace(/\b12 Months\b/g, "12 Ay")
      .replace(/\bNext 30 Days\b/g, "Sonraki 30 Gün")
      .replace(/\bNext 90 Days\b/g, "Sonraki 90 Gün")
      .replace(/\bNext 6 months\b/gi, "Sonraki 6 Ay")
      .replace(/\bNext 12 months\b/gi, "Sonraki 12 Ay")
      .replace(/\band\b/gi, "ve")
      .replace(/\bD2C unit sales, recurring subscriptions, ve B2B wholesale accounts\b/g, "D2C ürün satışları, tekrar eden abonelikler ve B2B toptan hesaplar")
      .replace(/\bhold spend until proof points improve\b/gi, "Kanıt noktaları iyileşene kadar harcamayı sınırlayın")
      .replace(/\bDo not scale spend until[^.\n]*(?:\.[^\n]*)?/gi, "Kanıt noktaları güçlenene kadar harcamayı ölçeklendirmeyin.")
      .replace(/\bprove customer pain\b/gi, "müşteri problemini kanıtlayın")
      .replace(/\bvalidate repeatable acquisition\b/gi, "tekrarlanabilir müşteri edinimini doğrulayın")
      .replace(/\bExpected impact\b/gi, "Beklenen etki")
      .replace(/\bDefensibility is only partially evidenced\b/g, "Savunulabilirlik yalnızca kısmen kanıtlanmıştır")
      .replace(/\bSpecialty coffee and premium food & beverage benchmarks adjusted\.\.\./g, "Özel kahve ve premium yiyecek-içecek benchmarklarına göre düzenlenmiştir.")
      .replace(/\bRun primary research to validate market size and contribution margin assumptions\./g, "Pazar büyüklüğü ve katkı marjı varsayımlarını doğrulamak için birincil araştırma yapın.")
      .replace(/\bRun primary research to validate market size\.\.\./g, "Pazar büyüklüğü ve katkı marjı varsayımlarını doğrulamak için birincil araştırma yapın.")
      .replace(/\brun primary research to validate\b/gi, "doğrulamak için birincil araştırma yap")
      .replace(/\bdoğrulamak için birincil araştırma yap pazar büyüklüğü ve katkı marjı varsayımları\b/gi, "Pazar büyüklüğü ve katkı marjı varsayımlarını doğrulamak için birincil araştırma yapın.")
      .replace(/\bdoğrulamak için birincil araştırma yap pazar büyüklüğü ve katkı marjı varsayımları\./gi, "Pazar büyüklüğü ve katkı marjı varsayımlarını doğrulamak için birincil araştırma yapın.")
      .replace(/\bD2C unit sales, recurring subscriptions, and B2B wholesale accounts\b/g, "D2C ürün satışları, tekrar eden abonelikler ve B2B toptan hesaplar")
      .replace(/\bWorst Case\b/g, "Kötü Senaryo")
      .replace(/\bBase Case\b/g, "Baz Senaryo")
      .replace(/\bBest Case\b/g, "En İyi Senaryo")
      .replace(/\bINVESTMENT RECOMMENDATION\b/g, "YATIRIM TAVSİYESİ")
      .replace(/\bType: Industry benchmark\b/g, "Tür: Sektör benchmarkı")
      .replace(/\bType: Financial benchmark \/ planning assumption\b/g, "Tür: Finansal benchmark / planlama varsayımı")
      .replace(/\bType: Model assumption\b/g, "Tür: Model varsayımı")
      .replace(/\bType: Primary research required\b/g, "Tür: Birincil araştırma gerekli")
      .replace(/\bPlanning assumption\b/g, "Planlama varsayımı")
      .replace(/\bPlanning Assumption\b/g, "Planlama Varsayımı")
      .replace(/\bModel Estimate\b/g, "Model Tahmini")
      .replace(/\bBenchmark-derived\b/g, "Benchmark Tabanlı")
      .replace(/\bExecution risk\b/gi, "Yürütme Riski")
      .replace(/\bWatch\b/g, "İzleme")
      .replace(/\bOn track\b/g, "Yolunda")
      .replace(/\bModel target\b/g, "Model hedefi");
  }

  return localized
    .replace(/\bKaynak kategorisi: Planlama varsayımı\. Harici kaynak metadatası sağlanmadı\./g, "Source category: Planning assumption. External citation metadata was not provided.")
    .replace(/\bAI Yönetici İçgörüsü\b/g, "AI Executive Insight")
    .replace(/\bTemel İçgörüler\b/g, "Key insights")
    .replace(/\bDoğrulama Beklemede\b/g, "Hold for validation")
    .replace(/\bDoğrulama gerekli\b/gi, "Validation required")
    .replace(/\bDOĞRULAMA GEREKLİ\b/g, "VALIDATION REQUIRED")
    .replace(/\bYiyecek & İçecek \/ Özel Kahve\b/g, "Food & Beverage / Specialty Coffee")
    .replace(/\bD2C Marka \+ Abonelik \+ B2B\b/g, "D2C Brand + Subscription + B2B")
    .replace(/\bÖzel kahve ve premium yiyecek-içecek benchmarklarına göre düzenlenmiştir\./g, "Specialty coffee and premium food & beverage benchmarks adjusted...")
    .replace(/\bPazar büyüklüğü ve katkı marjı varsayımlarını doğrulamak için birincil araştırma yapın\./g, "Run primary research to validate market size and contribution margin assumptions.")
    .replace(/\bD2C ürün satışları, tekrar eden abonelikler ve B2B toptan hesaplar\b/g, "D2C unit sales, recurring subscriptions, and B2B wholesale accounts")
    .replace(/\bKötü Senaryo\b/g, "Worst Case")
    .replace(/\bBaz Senaryo\b/g, "Base Case")
    .replace(/\bEn İyi Senaryo\b/g, "Best Case")
    .replace(/\bYATIRIM TAVSİYESİ\b/g, "INVESTMENT RECOMMENDATION")
    .replace(/\bTür: Sektör benchmarkı\b/g, "Type: Industry benchmark")
    .replace(/\bTür: Finansal benchmark \/ planlama varsayımı\b/g, "Type: Financial benchmark / planning assumption")
    .replace(/\bTür: Model varsayımı\b/g, "Type: Model assumption")
    .replace(/\bTür: Birincil araştırma gerekli\b/g, "Type: Primary research required")
    .replace(/\bPlanlama varsayımı\b/g, "Planning assumption")
    .replace(/\bPlanlama Varsayımı\b/g, "Planning Assumption")
    .replace(/\bModel Tahmini\b/g, "Model Estimate")
    .replace(/\bBenchmark Tabanlı\b/g, "Benchmark-derived")
    .replace(/\bYürütme Riski\b/g, "Execution risk")
    .replace(/\bİzleme\b/g, "Watch")
    .replace(/\bYolunda\b/g, "On track")
    .replace(/\bModel hedefi\b/g, "Model target");
}

export function localizePdfReportSections(sections = [], locale) {
  const resolvedLocale =
    locale ||
    detectPdfPresentationLocale(
      sections.map((section) => `${section?.title || ""}\n${section?.content || ""}`).join("\n\n")
    );

  return sections.map((section) => ({
    ...section,
    title: localizePdfPresentationLabel(section.title, resolvedLocale),
    content: section.content,
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
