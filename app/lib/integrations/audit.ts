import "server-only";

type SupabaseLike = {
  from: (table: string) => {
    insert: (payload: Record<string, unknown>) => Promise<{ error?: unknown }>;
  };
};

function sanitizeAuditMetadata(metadata: Record<string, unknown> = {}) {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (/secret|token|key|password|card|authorization/i.test(key)) {
      sanitized[key] = "[redacted]";
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export async function recordIntegrationAuditEvent(input: {
  supabase: SupabaseLike;
  actorUserId: string;
  action: string;
  targetUserId?: string;
  metadata?: Record<string, unknown>;
}) {
  const payload = {
    admin_user_id: input.actorUserId,
    action: `integration.${input.action}`,
    target_user_id: input.targetUserId ?? null,
    metadata: sanitizeAuditMetadata(input.metadata),
  };

  const { error } = await input.supabase.from("admin_audit_log").insert(payload);

  return { ok: !error, error };
}
