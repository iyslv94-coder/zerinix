import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const billingPage = readFileSync("app/dashboard/billing/page.tsx", "utf8");
const billingActions = readFileSync("app/dashboard/billing/actions.ts", "utf8");
const billingData = readFileSync("app/dashboard/billing/billing-data.ts", "utf8");
const stripeFoundation = readFileSync("app/lib/billing/stripe.ts", "utf8");
const governance = readFileSync("app/lib/ai/governance.ts", "utf8");

test("billing page requires authentication before rendering user billing data", () => {
  assert.match(billingPage, /getAuthenticatedUser\(supabase\)/);
  assert.match(billingPage, /redirect\("\/login\?next=\/dashboard\/billing"\)/);
  assert.match(billingPage, /loadBillingOverview\(supabase, user\)/);
});

test("billing actions are server-side and rate limited", () => {
  assert.match(billingActions, /^"use server";/);
  assert.match(billingActions, /getBillingActionContext/);
  assert.match(billingActions, /getAuthenticatedUser\(supabase\)/);
  assert.match(billingActions, /checkRateLimit\(`billing:\$\{action\}:\$\{user\.id\}:\$\{ip\}`/);
  assert.match(billingActions, /Too many billing attempts/);
});

test("subscription changes validate server-owned plan configuration", () => {
  assert.match(billingActions, /normalizeBillingPlan/);
  assert.match(billingActions, /billingPlans\.find/);
  assert.match(billingActions, /!planConfig\?\.databaseTier/);
  assert.match(billingActions, /getStripeConfiguration\(\)/);
  assert.match(billingActions, /getPlanPriceState\(plan\)/);
  assert.doesNotMatch(billingActions, /customer_id|subscription_id|price_id/i);
});

test("duplicate checkout requests are blocked before Stripe work can begin", () => {
  assert.match(billingActions, /checkoutLocks/);
  assert.match(billingActions, /preventDuplicateCheckout/);
  assert.match(billingActions, /billing request is already in progress/i);
});

test("stripe foundation validates configuration and webhook signatures without exposing secrets", () => {
  assert.match(stripeFoundation, /STRIPE_SECRET_KEY/);
  assert.match(stripeFoundation, /STRIPE_WEBHOOK_SECRET/);
  assert.match(stripeFoundation, /verifyStripeWebhookSignature/);
  assert.match(stripeFoundation, /createHmac\("sha256", webhookSecret\)/);
  assert.match(stripeFoundation, /timingSafeEqual/);
  assert.match(stripeFoundation, /secretKeyExposed: false/);
  assert.match(stripeFoundation, /webhookSecretExposed: false/);
  assert.doesNotMatch(billingPage, /STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET/);
});

test("billing page shows missing Stripe configuration safely", () => {
  assert.match(billingPage, /Billing not configured/);
  assert.match(billingPage, /stripeMissing\.map/);
  assert.match(billingPage, /No payment, upgrade, downgrade or\s+cancellation will be executed/);
  assert.match(billingActions, /Billing is not configured yet/);
});

test("billing plans include Free Pro Team and Business with no fake pricing", () => {
  for (const plan of ["free", "pro", "team", "business"]) {
    assert.match(stripeFoundation, new RegExp(`id: "${plan}"`));
  }

  assert.match(stripeFoundation, /Not configured/);
  assert.match(stripeFoundation, /STRIPE_PRICE_PRO/);
  assert.match(stripeFoundation, /STRIPE_PRICE_TEAM/);
  assert.match(stripeFoundation, /STRIPE_PRICE_BUSINESS/);
});

test("billing usage rendering uses stored AI usage and existing quota rules", () => {
  assert.match(governance, /export const usageLimits/);
  assert.match(billingData, /ai_usage_events/);
  assert.match(billingData, /usageLimits\[planTier\]/);
  assert.match(billingPage, /AI Chat/);
  assert.match(billingPage, /AI Plan reports/);
  assert.match(billingPage, /Market Analysis/);
  assert.match(billingPage, /remaining/);
  assert.doesNotMatch(billingData, /openai|responses\.create|responses\.stream/i);
});

test("downgrade and cancellation flows require explicit confirmation surfaces", () => {
  assert.match(billingPage, /Downgrade plan/);
  assert.match(billingPage, /Confirm downgrade/);
  assert.match(billingPage, /Cancel subscription/);
  assert.match(billingPage, /Request cancellation/);
  assert.match(billingActions, /confirmDowngrade/);
  assert.match(billingActions, /requestCancellation/);
});

test("empty invoices and billing history render without mock payment data", () => {
  assert.match(billingData, /invoices: \[\] as Array<never>/);
  assert.match(billingData, /billingHistory: \[\] as Array<never>/);
  assert.match(billingPage, /No invoices are available yet/);
  assert.match(billingPage, /No billing events have been recorded yet/);
  assert.doesNotMatch(billingPage, /4242|Visa ending|Mastercard ending/i);
});
