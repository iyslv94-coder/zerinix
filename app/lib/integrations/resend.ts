import "server-only";

import {
  type IntegrationResult,
  integrationNotConfigured,
  isFeatureEnabled,
  readRequiredEnv,
} from "./config";

export type EmailPurpose =
  | "email_verification"
  | "password_reset"
  | "welcome"
  | "subscription"
  | "security_alert";

export type ResendEmailInput = {
  to: string;
  subject: string;
  html: string;
  purpose: EmailPurpose;
};

export function getResendConfiguration() {
  const missing = readRequiredEnv(["RESEND_API_KEY", "RESEND_FROM_EMAIL"]);

  return {
    configured: missing.length === 0,
    enabled: isFeatureEnabled("ENABLE_RESEND_EMAILS"),
    missing,
    from: process.env.RESEND_FROM_EMAIL || "",
  };
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function sendResendEmail(
  input: ResendEmailInput
): Promise<IntegrationResult<{ id: string | null; purpose: EmailPurpose }>> {
  const config = getResendConfiguration();

  if (!config.configured || !config.enabled) {
    return integrationNotConfigured("Resend", config.missing);
  }

  if (!isValidEmail(input.to) || !input.subject.trim() || !input.html.trim()) {
    return {
      ok: false,
      reason: "invalid_input",
      message: "Email request is invalid.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      reason: "invalid_input",
      message: "Email provider rejected the request.",
    };
  }

  const payload = (await response.json().catch(() => ({}))) as { id?: string };

  return {
    ok: true,
    source: "configured",
    data: { id: payload.id ?? null, purpose: input.purpose },
  };
}

export function buildSecurityAlertEmail(input: { productName?: string; message: string }) {
  const productName = input.productName || "ZERINIX";

  return {
    subject: `${productName} security alert`,
    html: `<p>${input.message.replace(/[<>&]/g, "")}</p>`,
    purpose: "security_alert" as const,
  };
}
