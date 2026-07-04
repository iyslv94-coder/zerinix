"use client";

import { memo, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarDays,
  Download,
  FileText,
  Gauge,
  Landmark,
  Palette,
  PieChart,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";

type ReportSection = {
  title: string;
  icon: LucideIcon;
  content: string;
};

const sectionMatchers: Record<string, string[]> = {
  "Executive Summary": ["Executive Summary", "Özet", "Yönetici Özeti"],
  "Market Analysis": [
    "Market Analysis",
    "Market size",
    "Competition level",
    "Pazar Analizi",
    "Pazar Büyüklüğü",
    "Rekabet Seviyesi",
  ],
  "Target Audience": ["Target Audience", "Hedef Kitle"],
  "Revenue Model": ["Revenue Model", "Revenue potential", "Gelir Modeli", "Gelir Potansiyeli"],
  Risks: ["Risks", "Main risks", "Riskler", "Ana Riskler"],
  "90-Day Roadmap": [
    "90-Day Roadmap",
    "Recommended first steps",
    "90 Günlük Yol Haritası",
    "Önerilen İlk Adımlar",
  ],
  "AI Success Score (0-100)": [
    "AI Success Score",
    "AI score",
    "AI Başarı Skoru",
    "AI Skoru",
  ],
  Sources: ["Sources", "Kaynaklar"],
};

const sectionIcons: Record<string, LucideIcon> = {
  "Executive Summary": Sparkles,
  "Market Analysis": BarChart3,
  "Target Audience": Users,
  "Revenue Model": Landmark,
  Risks: ShieldAlert,
  "90-Day Roadmap": CalendarDays,
  "AI Success Score (0-100)": Gauge,
  Sources: Search,
};

const reportActions = [
  { label: "Competitor Analysis", icon: Search },
  { label: "Financial Plan", icon: PieChart },
  { label: "Brand Strategy", icon: Palette },
  { label: "Export PDF", icon: Download },
];

const reportSectionTitles = [
  "Executive Summary",
  "Market Analysis",
  "Target Audience",
  "Revenue Model",
  "Risks",
  "90-Day Roadmap",
  "AI Success Score (0-100)",
  "Sources",
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeHeading(value: string) {
  return value
    .replace(/^\s*[-*#\d.)]+\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/:$/, "")
    .trim()
    .toLowerCase();
}

function parseReportSections(result: string): ReportSection[] {
  const headings = Object.values(sectionMatchers).flat();
  const headingPattern = headings.map(escapeRegExp).join("|");
  const parts = result.split(new RegExp(`(^|\\n)\\s*(?:#{1,3}\\s*)?(${headingPattern})\\s*:?\\s*`, "i"));
  const contentByHeading = new Map<string, string>();

  for (let index = 2; index < parts.length; index += 3) {
    const heading = normalizeHeading(parts[index]);
    const content = (parts[index + 1] || "").trim();

    if (content) {
      contentByHeading.set(heading, content);
    }
  }

  const fallback = result.trim();

  return Object.entries(sectionMatchers).map(([title, aliases], index) => {
    const matchedContent = aliases
      .map((alias) => contentByHeading.get(normalizeHeading(alias)))
      .filter(Boolean)
      .join("\n\n");

    return {
      title,
      icon: sectionIcons[title],
      content:
        matchedContent ||
        (index === 0 && fallback
          ? fallback
          : "Bu bölüm için AI çıktısı bekleniyor."),
    };
  });
}

const ReportPanel = memo(function ReportPanel({ result }: { result: string }) {
  const sections = useMemo(
    () => (result ? parseReportSections(result) : []),
    [result]
  );

  if (!result) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-3xl border border-white/10 bg-zinc-950/70 p-8 text-center shadow-2xl shadow-black/40">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <FileText className="h-5 w-5 text-teal-200" />
          </div>
          <p className="mt-5 text-lg font-semibold text-white">
            AI raporu burada hazırlanacak.
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            İş fikrini yaz ve ZERINIX rapor panelini oluştur.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-h-[80vh] overflow-y-auto pr-1">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.35em] text-teal-300/70">
            ZERINIX REPORT
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            Business Intelligence Report
          </h2>
        </div>
        <div className="rounded-full border border-teal-300/20 bg-teal-300/10 px-4 py-2 text-sm text-teal-100">
          AI Ready
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <article
              key={section.title}
              className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl shadow-black/30"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Icon className="h-5 w-5 text-teal-200" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {section.title}
                  </h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                    {section.content}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {reportActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              type="button"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-zinc-800"
            >
              <Icon className="h-4 w-4 text-teal-200" />
              {action.label}
            </button>
          );
        })}
      </div>
    </section>
  );
});

export default function Planner() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  async function readStreamingResult(response: Response, fallbackMessage: string) {
    if (!response.ok || !response.body) {
      try {
        const data = await response.json();
        setResult(data.error || fallbackMessage);
      } catch {
        setResult(fallbackMessage);
      }

      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let output = "";
    let frame: number | null = null;

    const scheduleResultUpdate = () => {
      if (frame !== null) {
        return;
      }

      frame = requestAnimationFrame(() => {
        frame = null;
        setResult(output);
      });
    };

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      output += decoder.decode(value, { stream: true });
      scheduleResultUpdate();
    }

    output += decoder.decode();
    if (frame !== null) {
      cancelAnimationFrame(frame);
    }

    setResult(output || fallbackMessage);
  }

  async function readStreamingSection(
    response: Response,
    onChunk: (chunk: string) => void,
    fallbackMessage: string,
    onFirstChunk?: () => void
  ) {
    if (!response.ok || !response.body) {
      try {
        const data = await response.json();
        onChunk(data.error || fallbackMessage);
      } catch {
        onChunk(fallbackMessage);
      }

      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let hasChunk = false;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });

      if (!hasChunk && chunk) {
        hasChunk = true;
        onFirstChunk?.();
      }

      onChunk(chunk);
    }

    const finalChunk = decoder.decode();
    if (finalChunk) {
      onChunk(finalChunk);
    }
  }

  async function generatePlan() {
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      await readStreamingResult(res, "Cevap alınamadı.");
    } catch {
      setResult("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeMarket() {
    setAnalyzing(true);
    setResult("");

    const sectionOutput = Object.fromEntries(
      reportSectionTitles.map((section) => [section, ""])
    ) as Record<string, string>;
    let frame: number | null = null;
    let remainingSectionsStarted = false;
    let remainingSectionsPromise: Promise<void[]> = Promise.resolve([]);

    const renderReport = () => {
      setResult(
        reportSectionTitles
          .map((section) => `${section}\n${sectionOutput[section]}`)
          .join("\n\n")
      );
    };

    const scheduleReportRender = () => {
      if (frame !== null) {
        return;
      }

      frame = requestAnimationFrame(() => {
        frame = null;
        renderReport();
      });
    };

    const streamSection = async (section: string, onFirstChunk?: () => void) => {
      const res = await fetch("/api/market-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, section }),
      });

      await readStreamingSection(
        res,
        (chunk) => {
          sectionOutput[section] += chunk;
          scheduleReportRender();
        },
        "Bu bölüm için AI çıktısı alınamadı.",
        onFirstChunk
      );
    };

    const startRemainingSections = () => {
      if (remainingSectionsStarted) {
        return;
      }

      remainingSectionsStarted = true;
      remainingSectionsPromise = Promise.all(
        reportSectionTitles
          .slice(1)
          .map((section) =>
            streamSection(section).catch(() => {
              sectionOutput[section] = "Bu bölüm için AI çıktısı alınamadı.";
              scheduleReportRender();
            })
          )
      );
    };

    try {
      await streamSection("Executive Summary", startRemainingSections);
      startRemainingSections();
      await remainingSectionsPromise;

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }

      renderReport();
    } catch {
      setResult("Pazar analizi sırasında bir hata oluştu.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <div className="bg-zinc-900 rounded-3xl p-8">
          <p className="text-sm tracking-[6px] text-zinc-500 mb-6">
            ZERINIX PLANLAYICI
          </p>

          <h1 className="text-5xl font-bold leading-tight mb-8">
            Hedefini anlat,
            <br />
            ZERINIX yol haritanı hazırlasın.
          </h1>

          <p className="text-zinc-400 mb-6">
            İş fikrini, hedefini ve bütçeni yaz.
          </p>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-56 mt-8 rounded-2xl bg-zinc-800 p-5 outline-none resize-none"
            placeholder="Örneğin: ABD'de yapay zeka şirketi kurmak istiyorum."
          />

          <button
            onClick={generatePlan}
            disabled={loading}
            className="mt-6 w-full bg-white text-black py-4 rounded-2xl font-semibold disabled:opacity-60"
          >
            {loading ? "AI düşünüyor..." : "AI Plan Oluştur"}
          </button>

          <button
            onClick={analyzeMarket}
            disabled={analyzing}
            className="mt-4 w-full bg-zinc-700 text-white py-4 rounded-2xl font-semibold disabled:opacity-60"
          >
            {analyzing ? "Pazar analizi yapılıyor..." : "Pazar Analizi Yap"}
          </button>
        </div>

        <ReportPanel result={result} />
      </div>
    </main>
  );
}
