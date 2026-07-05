type ResponseLanguage = "English" | "Turkish";

export function ceoAgent(prompt: string, language: ResponseLanguage = "English") {
  if (language === "Turkish") {
    return `Başlıklar: İş modeli, Strateji, Öncelikler, Riskler, İlk 30 gün planı, CEO tavsiyesi.
Kısa paragraflar ve uygulanabilir maddeler kullan. Hedef: ${prompt}`;
  }

  return `Headings: Business Model, Strategy, Priorities, Risks, First 30-Day Plan, CEO Recommendation.
Use short paragraphs and actionable bullets. Goal: ${prompt}`;
}
