import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const sectionPrompts: Record<string, { prompt: string; maxTokens: number }> = {
  "Executive Summary": {
    prompt:
      "2-3 cümlelik yönetici özeti yaz. Fırsatı, kime satıldığını ve ilk odak noktasını belirt. Başlık yazma.",
    maxTokens: 160,
  },
  "Market Analysis": {
    prompt:
      "Pazar büyüklüğü, talep sinyalleri ve rekabet seviyesini kısa, net analiz et. Başlık yazma.",
    maxTokens: 220,
  },
  "Target Audience": {
    prompt:
      "En uygun hedef kitleyi, erken benimseyenleri ve satın alma motivasyonlarını belirt. Başlık yazma.",
    maxTokens: 190,
  },
  "Revenue Model": {
    prompt:
      "Gelir modelini, fiyatlama mantığını ve gelir potansiyelini kısa şekilde açıkla. Başlık yazma.",
    maxTokens: 190,
  },
  Risks: {
    prompt:
      "Ana riskleri ve her risk için pratik azaltma aksiyonunu yaz. Başlık yazma.",
    maxTokens: 190,
  },
  "90-Day Roadmap": {
    prompt:
      "İlk 90 gün için uygulanabilir yol haritası yaz: 0-30, 31-60, 61-90 gün. Başlık yazma.",
    maxTokens: 220,
  },
  "AI Success Score (0-100)": {
    prompt:
      "0-100 arası başarı skoru ver ve skoru etkileyen 2 kısa gerekçe yaz. Başlık yazma.",
    maxTokens: 120,
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
Türkçe, net, uygulanabilir yaz. Web adresi, alan adı, marka adı veya site önerisi verme.`
          : `ZERINIX için Türkçe pazar raporu yaz. İş fikri: ${prompt}

Başlıklar: Executive Summary, Market Analysis, Target Audience, Revenue Model, Risks, 90-Day Roadmap, AI Success Score (0-100).
Net, uygulanabilir, kısa paragraflar kullan. Web adresi, alan adı, marka adı veya site önerisi verme.`,
        max_output_tokens: sectionConfig?.maxTokens ?? 1000,
        stream: true,
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
