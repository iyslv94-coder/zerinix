import "server-only";

import { logOperationalError, logOperationalInfo } from "@/app/lib/security/logging";
import {
  type IntegrationResult,
  integrationNotConfigured,
  isFeatureEnabled,
  readRequiredEnv,
} from "./config";
import { logEmailDeliveryEvent, type EmailDeliverySupabaseLike } from "./resend-delivery-log";

export type EmailPurpose =
  | "email_verification"
  | "password_reset"
  | "welcome"
  | "workspace_invitation"
  | "report_ready"
  | "billing_receipt"
  | "subscription"
  | "security_alert";

export type ResendEmailInput = {
  to: string;
  subject: string;
  html: string;
  purpose: EmailPurpose;
  text?: string;
  userId?: string | null;
  supabase?: EmailDeliverySupabaseLike;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
};

export function getResendConfiguration() {
  const missing = readRequiredEnv(["RESEND_API_KEY", "RESEND_FROM_EMAIL"]);
  const retryCount = Number(process.env.RESEND_MAX_RETRIES || "2");

  return {
    configured: missing.length === 0,
    enabled: isFeatureEnabled("ENABLE_RESEND_EMAILS"),
    missing,
    from: process.env.RESEND_FROM_EMAIL || "",
    replyTo: process.env.RESEND_REPLY_TO_EMAIL || "",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "",
    maxRetries: Number.isFinite(retryCount) ? Math.max(0, Math.min(5, retryCount)) : 2,
  };
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizeRecipient(value: string) {
  const [local = "", domain = ""] = value.split("@");

  if (!domain) {
    return "invalid";
  }

  return `${local.slice(0, 2)}***@${domain}`;
}

function shouldRetry(status: number) {
  return status === 429 || status >= 500;
}

function readProviderMessage(payload: unknown) {
  if (typeof payload === "object" && payload !== null && "message" in payload) {
    return String((payload as { message?: unknown }).message || "");
  }

  return "";
}

async function waitForRetry(attempt: number) {
  const delay = Math.min(1000, 150 * 2 ** attempt);

  await new Promise((resolve) => setTimeout(resolve, delay));
}

async function recordDelivery(input: {
  request: ResendEmailInput;
  status: "sent" | "failed" | "skipped";
  attempts: number;
  providerMessageId?: string | null;
  errorMessage?: string;
}) {
  if (!input.request.supabase) {
    return;
  }

  await logEmailDeliveryEvent({
    supabase: input.request.supabase,
    userId: input.request.userId || null,
    recipientEmail: input.request.to,
    purpose: input.request.purpose,
    subject: input.request.subject,
    providerMessageId: input.providerMessageId || null,
    status: input.status,
    attempts: input.attempts,
    errorMessage: input.errorMessage || null,
    metadata: input.request.metadata || {},
  });
}

export async function sendResendEmail(
  input: ResendEmailInput
): Promise<IntegrationResult<{ id: string | null; purpose: EmailPurpose; attempts: number }>> {
  const config = getResendConfiguration();

  if (!config.configured || !config.enabled) {
    await recordDelivery({
      request: input,
      status: "skipped",
      attempts: 0,
      errorMessage: "Resend is not configured.",
    });

    return integrationNotConfigured("Resend", config.missing);
  }

  if (!isValidEmail(input.to) || !input.subject.trim() || !input.html.trim()) {
    await recordDelivery({
      request: input,
      status: "failed",
      attempts: 0,
      errorMessage: "Email request is invalid.",
    });

    return {
      ok: false,
      reason: "invalid_input",
      message: "Email request is invalid.",
    };
  }

  const apiKey = process.env.RESEND_API_KEY || "";
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (input.idempotencyKey) {
    headers["Idempotency-Key"] = input.idempotencyKey;
  }

  if (config.replyTo) {
    headers["Reply-To"] = config.replyTo;
  }

  let lastError = "";
  let attempts = 0;
  const maxAttempts = config.maxRetries + 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    attempts = attempt + 1;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers,
        body: JSON.stringify({
          from: config.from,
          to: input.to,
          subject: input.subject,
          html: input.html,
          text: input.text,
          reply_to: config.replyTo || undefined,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { id?: string };

      if (response.ok) {
        await recordDelivery({
          request: input,
          status: "sent",
          attempts,
          providerMessageId: payload.id ?? null,
        });
        logOperationalInfo("[resend] email sent", {
          purpose: input.purpose,
          recipient: sanitizeRecipient(input.to),
          attempts,
        });

        return {
          ok: true,
          source: "configured",
          data: { id: payload.id ?? null, purpose: input.purpose, attempts },
        };
      }

      lastError = readProviderMessage(payload) || `Resend responded with ${response.status}.`;

      if (!shouldRetry(response.status) || attempt === maxAttempts - 1) {
        break;
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Email provider request failed.";

      if (attempt === maxAttempts - 1) {
        break;
      }
    }

    await waitForRetry(attempt);
  }

  await recordDelivery({
    request: input,
    status: "failed",
    attempts,
    errorMessage: lastError || "Email provider rejected the request.",
  });
  logOperationalError("[resend] email failed", new Error(lastError), {
    purpose: input.purpose,
    recipient: sanitizeRecipient(input.to),
    attempts,
  });

  return {
    ok: false,
    reason: "invalid_input",
    message: "Email provider rejected the request.",
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
