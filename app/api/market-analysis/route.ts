import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const sectionPrompts: Record<string, { prompt: string; maxTokens: number }> = {
  "Executive Summary": {
    prompt:
      "Güncel web araştırmasına dayanarak 2-3 cümlelik yönetici özeti yaz. Pazar fırsatı, kime satıldığı ve ilk odak noktasını belirt. Başlık yazma.",
    maxTokens: 190,
  },
  "Market Analysis": {
    prompt:
      "Güncel kaynaklardan pazar büyüklüğü, rakip şirketler, sektör trendleri ve son haberleri kısa analiz et. Başlık yazma.",
    maxTokens: 270,
  },
  "Target Audience": {
    prompt:
      "Güncel pazar sinyallerine göre hedef müşteri segmentlerini, erken benimseyenleri ve satın alma motivasyonlarını belirt. Başlık yazma.",
    maxTokens: 210,
  },
  "Revenue Model": {
    prompt:
      "Rakip fiyatlandırma modellerini ve gelir potansiyelini kullanarak uygun gelir modelini öner. Başlık yazma.",
    maxTokens: 210,
  },
  Risks: {
    prompt:
      "SWOT için kullanılabilecek güncel verilerle ana riskleri ve azaltma aksiyonlarını yaz. Başlık yazma.",
    maxTokens: 210,
  },
  "90-Day Roadmap": {
    prompt:
      "Web araştırmasından çıkan pazar gerçeklerine göre ilk 90 gün için uygulanabilir yol haritası yaz: 0-30, 31-60, 61-90 gün. Başlık yazma.",
    maxTokens: 220,
  },
  "AI Success Score (0-100)": {
    prompt:
      "Güncel rekabet, pazar büyüklüğü, trendler ve risklere göre 0-100 arası başarı skoru ver; 2 kısa gerekçe yaz. Başlık yazma.",
    maxTokens: 150,
  },
  Sources: {
    prompt:
      "Web araştırmasında kullandığın en güvenilir 4-6 kaynağı listele. Her satırda kaynak adı, kısa kullanım nedeni ve URL olsun. Başlık yazma.",
    maxTokens: 220,
  },
};

export async function POST(req: Request) {
  try {
    const { prompt, section } = await req.json();
    const sectionConfig =
      typeof section === "string" ? sectionPrompts[section] : undefined;

    const stream = await client.responses.create(
      {
        model: "gpt-5-mini",
        input: sectionConfig
          ? `ZERINIX pazar raporu bölümü. İş fikri: ${prompt}

Görev: ${sectionConfig.prompt}
Önce güncel web araştırması yap. Güvenilir kaynaklardan pazar büyüklüğü, rakip şirketler, sektör trendleri, hedef müşteri, son haberler, fiyatlandırma modelleri ve SWOT verilerini dikkate al.
Türkçe, net, uygulanabilir yaz. Ürün için web adresi, alan adı, marka adı veya site önerisi verme; yalnızca Sources bölümünde kaynak URL'si yaz.`
          : `ZERINIX için Türkçe pazar raporu yaz. İş fikri: ${prompt}

Başlıklar: Executive Summary, Market Analysis, Target Audience, Revenue Model, Risks, 90-Day Roadmap, AI Success Score (0-100).
Önce güncel web araştırması yap ve rapor sonunda Sources başlığı altında kullanılan kaynakları listele.
Net, uygulanabilir, kısa paragraflar kullan. Ürün için web adresi, alan adı, marka adı veya site önerisi verme; yalnızca kaynak URL'si yaz.`,
        max_output_tokens: sectionConfig?.maxTokens ?? 1000,
        stream: true,
        tools: [
          {
            type: "web_search_preview",
            search_context_size: "low",
          },
        ],
        include: ["web_search_call.action.sources"],
        text: {
          verbosity: "medium",
        },
      },
      { signal: req.signal }
    );

    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              if (event.type === "response.output_text.delta") {
                controller.enqueue(encoder.encode(event.delta));
              }
            }

            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
        },
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Pazar analizi oluşturulamadı." },
      { status: 500 }
    );
  }
}
