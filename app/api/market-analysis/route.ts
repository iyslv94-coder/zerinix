import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const stream = await client.responses.create(
      {
        model: "gpt-5-mini",
        input: `ZERINIX için Türkçe pazar raporu yaz. İş fikri: ${prompt}

Başlıklar: Executive Summary, Market Analysis, Target Audience, Revenue Model, Risks, 90-Day Roadmap, AI Success Score (0-100).
Net, uygulanabilir, kısa paragraflar kullan. Web adresi, alan adı, marka adı veya site önerisi verme.`,
        max_output_tokens: 1000,
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
