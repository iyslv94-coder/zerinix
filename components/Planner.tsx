"use client";

import { useState } from "react";

export default function Planner() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  async function generatePlan() {
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResult(data.result || data.error || "Cevap alınamadı.");
    } catch {
      setResult("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeMarket() {
    setAnalyzing(true);
    setResult("");

    try {
      const res = await fetch("/api/market-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResult(data.result || data.error || "Pazar analizi alınamadı.");
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

        <div className="bg-zinc-900 rounded-3xl p-8 whitespace-pre-wrap overflow-y-auto max-h-[80vh]">
          {result || "AI sonucu burada görünecek."}
        </div>
      </div>
    </main>
  );
}
