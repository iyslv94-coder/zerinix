import "server-only";

export type IntegrationName = "stripe" | "resend" | "storage" | "notifications";

export type IntegrationStatus = {
  name: IntegrationName;
  configured: boolean;
  enabled: boolean;
  missing: string[];
};

export type IntegrationResult<T> =
  | { ok: true; data: T; source: "configured" }
  | {
      ok: false;
      reason: "not_configured" | "not_authorized" | "rate_limited" | "invalid_input";
      message: string;
      missing?: string[];
    };

const truthyValues = new Set(["1", "true", "yes", "on", "enabled"]);

export function isFeatureEnabled(name: string) {
  return truthyValues.has(String(process.env[name] || "").trim().toLowerCase());
}

export function readRequiredEnv(names: string[]) {
  return names.filter((name) => !String(process.env[name] || "").trim());
}

export function readCsvEnv(name: string) {
  return String(process.env[name] || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function integrationNotConfigured<T>(
  service: string,
  missing: string[]
): IntegrationResult<T> {
  return {
    ok: false,
    reason: "not_configured",
    message: `${service} is not configured.`,
    missing,
  };
}

export function getProductionIntegrationStatuses(): IntegrationStatus[] {
  const stripeMissing = readRequiredEnv([
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_PRO",
    "STRIPE_PRICE_BUSINESS",
    "NEXT_PUBLIC_APP_URL",
  ]);
  const resendMissing = readRequiredEnv(["RESEND_API_KEY", "RESEND_FROM_EMAIL"]);
  const storageMissing = readRequiredEnv([
    "SUPABASE_STORAGE_AVATAR_BUCKET",
    "SUPABASE_STORAGE_USER_FILES_BUCKET",
  ]);
  const notificationMissing = [
    ...resendMissing.map((name) => `email:${name}`),
    ...readRequiredEnv(["ENABLE_IN_APP_NOTIFICATIONS"]).map((name) => `in_app:${name}`),
  ];

  return [
    {
      name: "stripe",
      configured: stripeMissing.length === 0,
      enabled: isFeatureEnabled("ENABLE_STRIPE_BILLING"),
      missing: stripeMissing,
    },
    {
      name: "resend",
      configured: resendMissing.length === 0,
      enabled: isFeatureEnabled("ENABLE_RESEND_EMAILS"),
      missing: resendMissing,
    },
    {
      name: "storage",
      configured: storageMissing.length === 0,
      enabled: isFeatureEnabled("ENABLE_SUPABASE_STORAGE"),
      missing: storageMissing,
    },
    {
      name: "notifications",
      configured: notificationMissing.length === 0,
      enabled: isFeatureEnabled("ENABLE_IN_APP_NOTIFICATIONS"),
      missing: notificationMissing,
    },
  ];
}

export function getSafeProductionConfigurationReport() {
  return getProductionIntegrationStatuses().map((status) => ({
    name: status.name,
    configured: status.configured,
    enabled: status.enabled,
    missing: status.missing,
  }));
}
