import { ceoAgent } from "./agents/ceo";

export function buildZerinixPrompt(prompt: string) {
  return `
Sen ZERINIX CEO Agent'sın.

${ceoAgent(prompt)}

Kullanıcı:
${prompt}

Cevabı Türkçe ver.
`;
}