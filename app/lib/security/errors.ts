import { logOperationalError } from "./logging";

export function logServerError(scope: string, error: unknown) {
  logOperationalError(`[${scope}]`, error);
}
