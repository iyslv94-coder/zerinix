import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const resend = readFileSync("app/lib/integrations/resend.ts", "utf8");
const templates = readFileSync("app/lib/integrations/email-templates.ts", "utf8");
const events = readFileSync("app/lib/integrations/email-events.ts", "utf8");
const deliveryLog = readFileSync("app/lib/integrations/resend-delivery-log.ts", "utf8");
const reportNotifyRoute = readFileSync("app/api/reports/[id]/notify/route.ts", "utf8");
const workspaceInviteRoute = readFileSync("app/api/workspace-invitations/route.ts", "utf8");
const stripeWebhook = readFileSync("app/lib/billing/stripe-webhook.ts", "utf8");
const planner = readFileSync("components/Planner.tsx", "utf8");
const migration = readFileSync(
  "supabase/migrations/20260711190000_add_email_delivery_events.sql",
  "utf8"
);

test("resend sender is server-only, retry-capable and logs delivery outcomes", () => {
  assert.match(resend, /import "server-only"/);
  assert.match(resend, /RESEND_MAX_RETRIES/);
  assert.match(resend, /Idempotency-Key/);
  assert.match(resend, /shouldRetry\(response\.status\)/);
  assert.match(resend, /logEmailDeliveryEvent/);
  assert.match(resend, /status: "sent"/);
  assert.match(resend, /status: "failed"/);
  assert.match(resend, /status: "skipped"/);
  assert.doesNotMatch(resend, /NEXT_PUBLIC_RESEND/);
  assert.doesNotMatch(resend, /RESEND_API_KEY.*return/);
});

test("responsive email templates cover required production email types", () => {
  for (const builder of [
    "buildWelcomeEmail",
    "buildPasswordResetEmail",
    "buildEmailVerificationEmail",
    "buildWorkspaceInvitationEmail",
    "buildReportReadyEmail",
    "buildBillingReceiptEmail",
    "buildSubscriptionEmail",
  ]) {
    assert.match(templates, new RegExp(`function ${builder}`));
  }

  assert.match(templates, /@media \(max-width: 620px\)/);
  assert.match(templates, /viewport/);
  assert.match(templates, /ZERINIX/);
});

test("email event helpers use service-role logging without exposing secrets", () => {
  assert.match(events, /createServiceRoleClient/);
  assert.match(events, /sendResendEmail/);
  assert.match(events, /sendPasswordResetEmail/);
  assert.match(events, /sendEmailVerificationEmail/);
  assert.match(events, /sendReportReadyEmail/);
  assert.match(events, /sendWorkspaceInvitationEmail/);
  assert.match(deliveryLog, /email_delivery_events/);
  assert.match(deliveryLog, /Bearer \[redacted\]/);
});

test("report-ready and workspace invitation email routes require auth and ownership", () => {
  assert.match(reportNotifyRoute, /supabase\.auth\.getUser/);
  assert.match(reportNotifyRoute, /status: 401/);
  assert.match(reportNotifyRoute, /\.eq\("user_id", user\.id\)/);
  assert.match(reportNotifyRoute, /sendReportReadyEmail/);
  assert.match(workspaceInviteRoute, /supabase\.auth\.getUser/);
  assert.match(workspaceInviteRoute, /status: 401/);
  assert.match(workspaceInviteRoute, /\.eq\("user_id", user\.id\)/);
  assert.match(workspaceInviteRoute, /sendWorkspaceInvitationEmail/);
});

test("billing receipt hooks are sent from verified Stripe webhook processing", () => {
  assert.match(stripeWebhook, /sendBillingReceiptEmail/);
  assert.match(stripeWebhook, /eventType === "invoice\.paid"/);
  assert.match(stripeWebhook, /sendSubscriptionEmail/);
  assert.match(stripeWebhook, /verifyStripeWebhookSignature/);
});

test("completed report saves trigger best-effort report-ready notification", () => {
  assert.match(planner, /notifyReportReady/);
  assert.match(planner, /\/api\/reports\/\$\{encodeURIComponent\(reportId\)\}\/notify/);
  assert.match(planner, /void notifyReportReady\(savedReportId\)/);
});

test("email delivery migration stores outcomes without client insert policies", () => {
  assert.match(migration, /create table if not exists public\.email_delivery_events/);
  assert.match(migration, /email_delivery_events_status_valid/);
  assert.match(migration, /email_delivery_events_purpose_valid/);
  assert.match(migration, /alter table public\.email_delivery_events enable row level security/);
  assert.match(migration, /Users can read own email delivery events/);
  assert.doesNotMatch(migration, /for insert\s+to authenticated/i);
});
