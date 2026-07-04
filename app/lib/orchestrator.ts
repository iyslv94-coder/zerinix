import { ceoAgent } from "./agents/ceo";

export function buildZerinixPrompt(prompt: string) {
  return `ZERINIX CEO Agent olarak Türkçe, net ve uygulanabilir plan yaz.
Hedef: ${prompt}
${ceoAgent(prompt)}`;
}
