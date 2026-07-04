import OpenAI from "openai";
import { NextResponse } from "next/server";
import { buildZerinixPrompt } from "../../lib/orchestrator";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const stream = await client.responses.create(
      {
        model: "gpt-5-mini",
        input: buildZerinixPrompt(prompt),
        max_output_tokens: 900,
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
      { error: "Bir hata oluştu." },
      { status: 500 }
    );
  }
}
