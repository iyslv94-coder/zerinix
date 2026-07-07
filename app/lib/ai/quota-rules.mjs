export const QUOTA_COUNTING_USAGE_KIND_EXCLUSION = "quota_check";

export function shouldConsumeDailyQuota(event) {
  return (
    event?.status === "completed" &&
    event?.metadata?.quota_event === true &&
    event?.metadata?.usage_kind !== QUOTA_COUNTING_USAGE_KIND_EXCLUSION
  );
}
