import "server-only";

import { logOperationalError } from "@/app/lib/security/logging";

export type EmailDeliverySupabaseLike = {
  from: (table: string) => {
    insert: (payload: Record<string, unknown>) => PromiseLike<{ error?: unknown }>;
  };
};

function sanitizeErrorMessage(message: string | null) {
  return String(message || "")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]")
    .slice(0, 500);
}

export async function logEmailDeliveryEvent(input: {
  supabase: EmailDeliverySupabaseLike;
  userId: string | null;
  recipientEmail: string;
  purpose: string;
  subject: string;
  providerMessageId: string | null;
  status: "sent" | "failed" | "skipped";
  attempts: number;
  errorMessage: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await input.supabase.from("email_delivery_events").insert({
    user_id: input.userId,
    recipient_email: input.recipientEmail,
    purpose: input.purpose,
    subject: input.subject,
    provider_message_id: input.providerMessageId,
    status: input.status,
    attempts: Math.max(0, input.attempts),
    error_message: sanitizeErrorMessage(input.errorMessage),
    metadata: input.metadata || {},
  });

  if (error) {
    logOperationalError("[resend:delivery-log]", error, {
      purpose: input.purpose,
      status: input.status,
    });
  }
}
