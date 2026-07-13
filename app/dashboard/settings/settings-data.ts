import type { SupabaseClient, User } from "@supabase/supabase-js";

export type UserSettingsProfile = {
  displayName: string;
  email: string;
  emailVerified: boolean;
  avatarUrl: string;
  themePreference: string;
  notificationPreference: string;
  timezonePreference: string;
  preferredLanguage: string;
  aiDefaultMode: string;
  riskTolerance: string;
  privacyAnalytics: boolean;
  privacyProductUpdates: boolean;
};

type AiChatProfileRow = {
  preferred_language?: string | null;
  risk_tolerance?: string | null;
  business_interests?: string[] | null;
};

function readMetadataString(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];

  return typeof value === "string" ? value : "";
}

function readMetadataBoolean(
  metadata: Record<string, unknown> | null | undefined,
  key: string,
  fallback: boolean
) {
  const value = metadata?.[key];

  return typeof value === "boolean" ? value : fallback;
}

function normalizeDisplayName(value: string, email: string) {
  const cleanValue = value.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanValue) {
    return "";
  }

  if (cleanValue.toLowerCase() === cleanEmail) {
    return "";
  }

  if (cleanEmail && cleanValue.toLowerCase() === cleanEmail.split("@")[0]) {
    return "";
  }

  return cleanValue;
}

export async function loadUserSettingsProfile(
  supabase: SupabaseClient,
  user: User
): Promise<UserSettingsProfile> {
  const { data } = await supabase
    .from("ai_chat_profiles")
    .select("preferred_language,risk_tolerance,business_interests")
    .eq("user_id", user.id)
    .maybeSingle();
  const chatProfile = (data || {}) as AiChatProfileRow;
  const metadata = user.user_metadata || {};
  const email = user.email || "";
  const displayName = normalizeDisplayName(
    readMetadataString(metadata, "full_name") ||
      readMetadataString(metadata, "name") ||
      "",
    email
  );

  return {
    displayName,
    email,
    emailVerified: Boolean(user.email_confirmed_at),
    avatarUrl: readMetadataString(metadata, "avatar_url"),
    themePreference: readMetadataString(metadata, "theme_preference") || "system",
    notificationPreference:
      readMetadataString(metadata, "notification_preference") || "product",
    timezonePreference:
      readMetadataString(metadata, "timezone_preference") ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC",
    preferredLanguage:
      chatProfile.preferred_language ||
      readMetadataString(metadata, "preferred_language") ||
      "English",
    aiDefaultMode: readMetadataString(metadata, "ai_default_mode") || "balanced",
    riskTolerance: chatProfile.risk_tolerance || "Moderate",
    privacyAnalytics: readMetadataBoolean(metadata, "privacy_analytics", true),
    privacyProductUpdates: readMetadataBoolean(metadata, "privacy_product_updates", true),
  };
}
