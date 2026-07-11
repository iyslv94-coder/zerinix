import "server-only";

import {
  type IntegrationResult,
  integrationNotConfigured,
  isFeatureEnabled,
  readRequiredEnv,
} from "./config";

type StorageBucket = "avatar" | "user_file";

type SupabaseStorageLike = {
  storage: {
    from: (bucket: string) => {
      createSignedUploadUrl?: (path: string) => Promise<{
        data: { signedUrl?: string; path?: string; token?: string } | null;
        error: unknown;
      }>;
      createSignedUrl?: (
        path: string,
        expiresIn: number
      ) => Promise<{ data: { signedUrl?: string } | null; error: unknown }>;
    };
  };
};

const safeFilenamePattern = /[^a-zA-Z0-9._-]+/g;

export function getStorageConfiguration() {
  const missing = readRequiredEnv([
    "SUPABASE_STORAGE_AVATAR_BUCKET",
    "SUPABASE_STORAGE_USER_FILES_BUCKET",
  ]);

  return {
    configured: missing.length === 0,
    enabled: isFeatureEnabled("ENABLE_SUPABASE_STORAGE"),
    missing,
    buckets: {
      avatar: process.env.SUPABASE_STORAGE_AVATAR_BUCKET || "",
      user_file: process.env.SUPABASE_STORAGE_USER_FILES_BUCKET || "",
    },
  };
}

export function sanitizeStorageFilename(filename: string) {
  const clean = filename
    .trim()
    .replace(safeFilenamePattern, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);

  return clean || "upload";
}

export function createUserStoragePath(userId: string, filename: string) {
  return `${userId}/${Date.now()}-${sanitizeStorageFilename(filename)}`;
}

export function assertUserOwnsStoragePath(userId: string, path: string) {
  return Boolean(userId && path.startsWith(`${userId}/`) && !path.includes(".."));
}

function readBucketName(bucket: StorageBucket) {
  const config = getStorageConfiguration();

  return config.buckets[bucket];
}

export async function createSignedUserUploadUrl(input: {
  supabase: SupabaseStorageLike;
  userId: string;
  filename: string;
  bucket: StorageBucket;
}): Promise<IntegrationResult<{ bucket: string; path: string; signedUrl?: string; token?: string }>> {
  const config = getStorageConfiguration();

  if (!config.configured || !config.enabled) {
    return integrationNotConfigured("Supabase Storage", config.missing);
  }

  const bucket = readBucketName(input.bucket);
  const path = createUserStoragePath(input.userId, input.filename);
  const storage = input.supabase.storage.from(bucket);

  if (!storage.createSignedUploadUrl) {
    return {
      ok: false,
      reason: "not_configured",
      message: "Signed upload URLs are not available.",
    };
  }

  const { data, error } = await storage.createSignedUploadUrl(path);

  if (error || !data) {
    return {
      ok: false,
      reason: "invalid_input",
      message: "Could not create a signed upload URL.",
    };
  }

  return {
    ok: true,
    source: "configured",
    data: { bucket, path, signedUrl: data.signedUrl, token: data.token },
  };
}

export async function createOwnedSignedReadUrl(input: {
  supabase: SupabaseStorageLike;
  userId: string;
  path: string;
  bucket: StorageBucket;
  expiresIn?: number;
}): Promise<IntegrationResult<{ signedUrl: string }>> {
  const config = getStorageConfiguration();

  if (!config.configured || !config.enabled) {
    return integrationNotConfigured("Supabase Storage", config.missing);
  }

  if (!assertUserOwnsStoragePath(input.userId, input.path)) {
    return {
      ok: false,
      reason: "not_authorized",
      message: "File ownership could not be verified.",
    };
  }

  const bucket = readBucketName(input.bucket);
  const storage = input.supabase.storage.from(bucket);

  if (!storage.createSignedUrl) {
    return {
      ok: false,
      reason: "not_configured",
      message: "Signed read URLs are not available.",
    };
  }

  const { data, error } = await storage.createSignedUrl(input.path, input.expiresIn ?? 300);

  if (error || !data?.signedUrl) {
    return {
      ok: false,
      reason: "invalid_input",
      message: "Could not create a signed read URL.",
    };
  }

  return { ok: true, source: "configured", data: { signedUrl: data.signedUrl } };
}
