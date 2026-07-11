type LogMetadata = Record<string, unknown>;

const sensitiveKeyPattern = /secret|token|key|password|authorization|cookie|card|session/i;

function sanitizeValue(key: string, value: unknown): unknown {
  if (sensitiveKeyPattern.test(key)) {
    return "[redacted]";
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === "object" && item !== null
        ? sanitizeMetadata(item as LogMetadata)
        : item
    );
  }

  if (typeof value === "object" && value !== null) {
    return sanitizeMetadata(value as LogMetadata);
  }

  return value;
}

export function sanitizeMetadata(metadata: LogMetadata = {}) {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [key, sanitizeValue(key, value)])
  );
}

export function shouldLogOperationalInfo() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ZERINIX_VERBOSE_LOGS === "true"
  );
}

export function logOperationalInfo(scope: string, metadata: LogMetadata = {}) {
  if (!shouldLogOperationalInfo()) {
    return;
  }

  console.info(scope, sanitizeMetadata(metadata));
}

export function logOperationalError(
  scope: string,
  error: unknown,
  metadata: LogMetadata = {}
) {
  const message = error instanceof Error ? error.message : String(error || "Unknown error");

  console.error(scope, sanitizeMetadata({ ...metadata, message }));
}
