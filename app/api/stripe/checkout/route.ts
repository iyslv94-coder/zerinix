import type { NextRequest } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { getAuthenticatedUser } from "@/app/dashboard/report-utils";
import {
  type BillingPlanId,
  billingPlans,
  createStripeCheckoutSession,
  getPlanPriceState,
  getStripeCheckoutConfiguration,
} from "@/app/lib/billing/stripe";
import { getUserBillingProfile } from "@/app/lib/billing/stripe-sync";
import { noStoreJson } from "@/app/lib/security/api-response";
import {
  checkRateLimit,
  getClientIpFromRequest,
  getRateLimitHeaders,
} from "@/app/lib/security/rate-limit";

export const dynamic = "force-dynamic";

function normalizeBillingPlan(value: unknown): BillingPlanId | "" {
  const plan = String(value || "").trim().toLowerCase();

  return plan === "free" || plan === "pro" || plan === "team" || plan === "business"
    ? plan
    : "";
}

async function readPlan(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as { plan?: unknown } | null;

    return normalizeBillingPlan(body?.plan);
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await req.formData().catch(() => null);

    return normalizeBillingPlan(formData?.get("plan"));
  }

  return normalizeBillingPlan(new URL(req.url).searchParams.get("plan"));
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  if (!user) {
    return noStoreJson({ error: "Authentication required." }, { status: 401 });
  }

  const ip = getClientIpFromRequest(req);
  const rateLimit = checkRateLimit(`stripe:checkout:${user.id}:${ip}`, {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return noStoreJson(
      { error: "Too many billing attempts. Please wait before trying again." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  const plan = await readPlan(req);

  if (!plan) {
    return noStoreJson({ error: "Invalid billing plan." }, { status: 400 });
  }

  const planConfig = billingPlans.find((item) => item.id === plan);

  if (!planConfig?.databaseTier) {
    return noStoreJson(
      { error: "This plan is not configured for subscriptions yet." },
      { status: 400 }
    );
  }

  const priceState = getPlanPriceState(plan);
  const checkoutConfig = getStripeCheckoutConfiguration(plan);

  if (!checkoutConfig.configured || !priceState.configured) {
    return noStoreJson(
      {
        error: "Billing is not configured yet. Your current plan was not changed.",
        missing: checkoutConfig.missing,
      },
      { status: 503 }
    );
  }

  const billingProfile = await getUserBillingProfile(supabase, user.id);
  const checkout = await createStripeCheckoutSession({
    userId: user.id,
    userEmail: user.email || "",
    plan,
    existingCustomerId: billingProfile?.stripe_customer_id,
    idempotencyKey: `checkout:${user.id}:${plan}`,
  });

  if (!checkout.ok) {
    return noStoreJson({ error: checkout.message }, { status: 400 });
  }

  if (!checkout.data.url) {
    return noStoreJson(
      { error: "Stripe checkout did not return a URL." },
      { status: 502 }
    );
  }

  return noStoreJson({
    id: checkout.data.id,
    url: checkout.data.url,
  });
}
