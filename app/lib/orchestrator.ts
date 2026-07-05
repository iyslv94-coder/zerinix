import { ceoAgent } from "./agents/ceo";

type ResponseLanguage = "English" | "Turkish";

export function buildZerinixPrompt(
  prompt: string,
  language: ResponseLanguage = "English"
) {
  if (language === "Turkish") {
    return `ZERINIX CEO Agent olarak net ve uygulanabilir plan yaz.
Hedef: ${prompt}
${ceoAgent(prompt, language)}`;
  }

  return `Write a clear and actionable plan as the ZERINIX CEO Agent.
Goal: ${prompt}
${ceoAgent(prompt, language)}`;
}
