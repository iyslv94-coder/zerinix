import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: `
Sen ZERINIX pazar analizi uzmanısın.

Kullanıcının iş fikri:
${prompt}

Sadece aşağıdaki başlıklarla Türkçe, net ve uygulanabilir bir pazar analizi ver:

Market size
Competition level
Target audience
Revenue potential
Main risks
Recommended first steps
AI score (0-100)

Web adresi, alan adı, marka adı veya site önerisi üretme.
`,
    });

    return NextResponse.json({
      result: response.output_text,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Pazar analizi oluşturulamadı." },
      { status: 500 }
    );
  }
}
