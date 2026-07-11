import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/app/lib/supabase/admin";
import {
  buildBillingReceiptEmail,
  buildEmailVerificationEmail,
  buildPasswordResetEmail,
  buildReportReadyEmail,
  buildSubscriptionEmail,
  buildWelcomeEmail,
  buildWorkspaceInvitationEmail,
} from "./email-templates";
import { sendResendEmail } from "./resend";

function appUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "";

  if (!configured) {
    return "";
  }

  return configured.startsWith("http") ? configured : `https://${configured}`;
}

function buildAbsoluteUrl(path: string) {
  const origin = appUrl();

  return origin ? `${origin}${path.startsWith("/") ? path : `/${path}`}` : "";
}

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatPeriod(start?: string | null, end?: string | null) {
  if (!start || !end) {
    return "";
  }

  return `${new Date(start).toLocaleDateString("en")} - ${new Date(end).toLocaleDateString("en")}`;
}

async function readAuthenticatedUserEmail(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error) {
    return "";
  }

  return data.user?.email || "";
}

export async function sendWelcomeEmail(input: {
  userId: string;
  email: string;
  name?: string;
  supabase?: SupabaseClient;
}) {
  const supabase = input.supabase || createServiceRoleClient();
  const template = buildWelcomeEmail({
    name: input.name,
    workspaceUrl: buildAbsoluteUrl("/dashboard"),
  });

  return sendResendEmail({
    ...template,
    to: input.email,
    userId: input.userId,
    supabase,
    idempotencyKey: `welcome:${input.userId}`,
  });
}

export async function sendPasswordResetEmail(input: {
  userId?: string | null;
  email: string;
  resetUrl: string;
  supabase?: SupabaseClient;
}) {
  const supabase = input.supabase || createServiceRoleClient();
  const template = buildPasswordResetEmail({ resetUrl: input.resetUrl });

  return sendResendEmail({
    ...template,
    to: input.email,
    userId: input.userId,
    supabase,
    idempotencyKey: `password-reset:${input.email.toLowerCase()}`,
  });
}

export async function sendEmailVerificationEmail(input: {
  userId?: string | null;
  email: string;
  verificationUrl: string;
  supabase?: SupabaseClient;
}) {
  const supabase = input.supabase || createServiceRoleClient();
  const template = buildEmailVerificationEmail({ verificationUrl: input.verificationUrl });

  return sendResendEmail({
    ...template,
    to: input.email,
    userId: input.userId,
    supabase,
    idempotencyKey: `email-verification:${input.email.toLowerCase()}`,
  });
}

export async function sendWorkspaceInvitationEmail(input: {
  inviterUserId: string;
  recipientEmail: string;
  workspaceId: string;
  workspaceName: string;
  inviterName?: string;
  supabase?: SupabaseClient;
}) {
  const supabase = input.supabase || createServiceRoleClient();
  const template = buildWorkspaceInvitationEmail({
    inviterName: input.inviterName,
    workspaceName: input.workspaceName,
    invitationUrl: buildAbsoluteUrl(`/dashboard/workspaces/${input.workspaceId}`),
  });

  return sendResendEmail({
    ...template,
    to: input.recipientEmail,
    userId: input.inviterUserId,
    supabase,
    idempotencyKey: `workspace-invitation:${input.workspaceId}:${input.recipientEmail.toLowerCase()}`,
    metadata: {
      workspaceId: input.workspaceId,
    },
  });
}

export async function sendReportReadyEmail(input: {
  userId: string;
  reportId: string;
  reportTitle: string;
  reportType: string;
  recipientEmail?: string;
  supabase?: SupabaseClient;
}) {
  const supabase = input.supabase || createServiceRoleClient();
  const email =
    input.recipientEmail || (await readAuthenticatedUserEmail(supabase, input.userId));

  if (!email) {
    return {
      ok: false as const,
      reason: "invalid_input" as const,
      message: "Report notification recipient is missing.",
    };
  }

  const template = buildReportReadyEmail({
    reportTitle: input.reportTitle,
    reportType: input.reportType,
    reportUrl: buildAbsoluteUrl(`/dashboard/reports/${input.reportId}`),
  });

  return sendResendEmail({
    ...template,
    to: email,
    userId: input.userId,
    supabase,
    idempotencyKey: `report-ready:${input.reportId}`,
    metadata: {
      reportId: input.reportId,
      reportType: input.reportType,
    },
  });
}

export async function sendBillingReceiptEmail(input: {
  userId: string;
  invoiceId: string;
  totalCents: number;
  currency: string;
  status: string;
  invoiceUrl?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  recipientEmail?: string;
  supabase?: SupabaseClient;
}) {
  const supabase = input.supabase || createServiceRoleClient();
  const email =
    input.recipientEmail || (await readAuthenticatedUserEmail(supabase, input.userId));

  if (!email) {
    return {
      ok: false as const,
      reason: "invalid_input" as const,
      message: "Billing receipt recipient is missing.",
    };
  }

  const template = buildBillingReceiptEmail({
    amount: formatCurrency(input.totalCents, input.currency),
    status: input.status,
    invoiceUrl: input.invoiceUrl,
    period: formatPeriod(input.periodStart, input.periodEnd),
  });

  return sendResendEmail({
    ...template,
    to: email,
    userId: input.userId,
    supabase,
    idempotencyKey: `billing-receipt:${input.invoiceId}`,
    metadata: {
      invoiceId: input.invoiceId,
      status: input.status,
    },
  });
}

export async function sendSubscriptionEmail(input: {
  userId: string;
  plan: string;
  status: string;
  recipientEmail?: string;
  supabase?: SupabaseClient;
}) {
  const supabase = input.supabase || createServiceRoleClient();
  const email =
    input.recipientEmail || (await readAuthenticatedUserEmail(supabase, input.userId));

  if (!email) {
    return {
      ok: false as const,
      reason: "invalid_input" as const,
      message: "Subscription email recipient is missing.",
    };
  }

  const template = buildSubscriptionEmail({
    plan: input.plan,
    status: input.status,
    billingUrl: buildAbsoluteUrl("/dashboard/billing"),
  });

  return sendResendEmail({
    ...template,
    to: email,
    userId: input.userId,
    supabase,
    idempotencyKey: `subscription:${input.userId}:${input.plan}:${input.status}`,
  });
}
