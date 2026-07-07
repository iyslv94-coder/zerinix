import test from "node:test";
import assert from "node:assert/strict";
import { shouldConsumeDailyQuota } from "../app/lib/ai/quota-rules.mjs";

const failedReasons = [
  "DailyAIUsageLimitReached",
  "ProviderError",
  "RateLimit",
  "Timeout",
  "GenerationFailed",
  "AbortError",
  "NetworkError",
];

test("successful completed report generation consumes daily quota", () => {
  assert.equal(
    shouldConsumeDailyQuota({
      status: "completed",
      metadata: {
        quota_event: true,
        usage_kind: "full_report_generation",
        quota_consumed: true,
      },
    }),
    true
  );
});

test("quota preflight rows do not consume daily quota", () => {
  assert.equal(
    shouldConsumeDailyQuota({
      status: "completed",
      metadata: {
        quota_event: true,
        usage_kind: "quota_check",
      },
    }),
    false
  );
});

test("cache hits do not consume daily quota", () => {
  assert.equal(
    shouldConsumeDailyQuota({
      status: "completed",
      metadata: {
        quota_event: false,
        usage_kind: "full_report_cache_hit",
        quota_consumed: false,
      },
    }),
    false
  );
});

test("failed generations never consume daily quota", () => {
  for (const failureReason of failedReasons) {
    assert.equal(
      shouldConsumeDailyQuota({
        status: "failed",
        metadata: {
          quota_event: false,
          usage_kind: "full_report_generation",
          quota_consumed: false,
          failure_reason: failureReason,
        },
      }),
      false,
      failureReason
    );
  }
});

test("rate-limited requests do not consume daily quota", () => {
  assert.equal(
    shouldConsumeDailyQuota({
      status: "rate_limited",
      metadata: {
        quota_event: false,
        usage_kind: "quota_check",
        quota_consumed: false,
        reason: "DailyAIUsageLimitReached",
      },
    }),
    false
  );
});
