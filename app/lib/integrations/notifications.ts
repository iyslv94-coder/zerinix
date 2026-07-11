import "server-only";

import {
  type IntegrationResult,
  integrationNotConfigured,
  isFeatureEnabled,
} from "./config";
import { getResendConfiguration, sendResendEmail } from "./resend";

export type NotificationRecord = {
  id: string;
  userId: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

type NotificationSupabaseLike = {
  from: (table: string) => {
    insert: (payload: Record<string, unknown>) => Promise<{
      data?: NotificationRecord[] | null;
      error?: unknown;
    }>;
    update: (payload: Record<string, unknown>) => {
      eq: (column: string, value: string) => {
        eq: (column: string, value: string) => Promise<{ error?: unknown }>;
      };
    };
  };
};

export function getNotificationConfiguration() {
  const resendConfig = getResendConfiguration();
  const inAppEnabled = isFeatureEnabled("ENABLE_IN_APP_NOTIFICATIONS");
  const missing = [
    ...resendConfig.missing.map((name) => `email:${name}`),
    !inAppEnabled ? "ENABLE_IN_APP_NOTIFICATIONS" : "",
  ].filter(Boolean);

  return {
    configured: missing.length === 0,
    emailEnabled: resendConfig.configured && resendConfig.enabled,
    inAppEnabled,
    missing,
  };
}

export async function createInAppNotification(input: {
  supabase: NotificationSupabaseLike;
  userId: string;
  title: string;
  body: string;
}): Promise<IntegrationResult<{ id: string | null }>> {
  const config = getNotificationConfiguration();

  if (!config.inAppEnabled) {
    return integrationNotConfigured("In-app notifications", ["ENABLE_IN_APP_NOTIFICATIONS"]);
  }

  if (!input.userId || !input.title.trim() || !input.body.trim()) {
    return {
      ok: false,
      reason: "invalid_input",
      message: "Notification request is invalid.",
    };
  }

  const { data, error } = await input.supabase.from("user_notifications").insert({
    user_id: input.userId,
    title: input.title,
    body: input.body,
    read_at: null,
  });

  if (error) {
    return integrationNotConfigured("In-app notifications", ["user_notifications table"]);
  }

  return {
    ok: true,
    source: "configured",
    data: { id: data?.[0]?.id ?? null },
  };
}

export async function markNotificationRead(input: {
  supabase: NotificationSupabaseLike;
  userId: string;
  notificationId: string;
}): Promise<IntegrationResult<{ notificationId: string }>> {
  const config = getNotificationConfiguration();

  if (!config.inAppEnabled) {
    return integrationNotConfigured("In-app notifications", ["ENABLE_IN_APP_NOTIFICATIONS"]);
  }

  const { error } = await input.supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", input.notificationId)
    .eq("user_id", input.userId);

  if (error) {
    return {
      ok: false,
      reason: "not_authorized",
      message: "Notification ownership could not be verified.",
    };
  }

  return {
    ok: true,
    source: "configured",
    data: { notificationId: input.notificationId },
  };
}

export async function sendEmailNotification(input: {
  to: string;
  title: string;
  html: string;
}) {
  return sendResendEmail({
    to: input.to,
    subject: input.title,
    html: input.html,
    purpose: "security_alert",
  });
}
