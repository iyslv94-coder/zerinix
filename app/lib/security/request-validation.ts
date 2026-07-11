type RequestValidationOptions = {
  maxBodyBytes?: number;
};

type RequestValidationResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

const DEFAULT_MAX_BODY_BYTES = 1_000_000;

function getRequestHost(request: Request) {
  return (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    new URL(request.url).host
  )
    .trim()
    .toLowerCase();
}

function validateSameOrigin(request: Request): RequestValidationResult {
  const origin = request.headers.get("origin");

  if (!origin) {
    return { ok: true };
  }

  try {
    const originHost = new URL(origin).host.toLowerCase();
    const requestHost = getRequestHost(request);

    if (originHost === requestHost) {
      return { ok: true };
    }
  } catch {
    return {
      ok: false,
      status: 403,
      message: "Invalid request origin.",
    };
  }

  return {
    ok: false,
    status: 403,
    message: "Cross-origin requests are not allowed.",
  };
}

function validateBodySize(
  request: Request,
  maxBodyBytes: number
): RequestValidationResult {
  const contentLength = request.headers.get("content-length");

  if (!contentLength) {
    return { ok: true };
  }

  const parsedLength = Number(contentLength);

  if (!Number.isFinite(parsedLength) || parsedLength < 0) {
    return {
      ok: false,
      status: 400,
      message: "Invalid request size.",
    };
  }

  if (parsedLength > maxBodyBytes) {
    return {
      ok: false,
      status: 413,
      message: "Request body is too large.",
    };
  }

  return { ok: true };
}

export function validateApiRequest(
  request: Request,
  options: RequestValidationOptions = {}
): RequestValidationResult {
  const originValidation = validateSameOrigin(request);

  if (!originValidation.ok) {
    return originValidation;
  }

  return validateBodySize(
    request,
    options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES
  );
}
