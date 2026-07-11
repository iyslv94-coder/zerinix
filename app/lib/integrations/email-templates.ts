import "server-only";

import type { EmailPurpose } from "./resend";

type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
  purpose: EmailPurpose;
};

type KeyValue = {
  label: string;
  value: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();

  return /^https?:\/\//i.test(trimmed) ? trimmed : "";
}

function renderRows(rows: KeyValue[] = []) {
  if (rows.length === 0) {
    return "";
  }

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-collapse:collapse;border:1px solid rgba(45,212,191,0.18);border-radius:14px;overflow:hidden;">
      ${rows
        .map(
          (row) => `
            <tr>
              <td style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.08);color:#8b949e;font-size:13px;">${escapeHtml(row.label)}</td>
              <td align="right" style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.08);color:#f8fafc;font-size:13px;font-weight:600;">${escapeHtml(row.value)}</td>
            </tr>
          `
        )
        .join("")}
    </table>
  `;
}

function renderAction(label: string, href: string) {
  const safeHref = normalizeUrl(href);

  if (!safeHref) {
    return "";
  }

  return `
    <div style="margin-top:28px;">
      <a href="${escapeHtml(safeHref)}" style="display:inline-block;border-radius:999px;background:#2dd4bf;color:#020617;text-decoration:none;font-weight:700;font-size:14px;padding:13px 20px;">
        ${escapeHtml(label)}
      </a>
    </div>
  `;
}

function buildText(input: {
  title: string;
  body: string;
  actionLabel?: string;
  actionUrl?: string;
  rows?: KeyValue[];
}) {
  const rows = (input.rows || [])
    .map((row) => `${row.label}: ${row.value}`)
    .join("\n");

  return [
    input.title,
    "",
    input.body,
    rows ? `\n${rows}` : "",
    input.actionLabel && input.actionUrl ? `\n${input.actionLabel}: ${input.actionUrl}` : "",
    "\nZERINIX",
  ]
    .filter(Boolean)
    .join("\n");
}

export function renderZerinixEmail(input: {
  eyebrow: string;
  title: string;
  body: string;
  actionLabel?: string;
  actionUrl?: string;
  rows?: KeyValue[];
}) {
  const escapedBody = escapeHtml(input.body).replace(/\n/g, "<br />");

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(input.title)}</title>
        <style>
          @media (max-width: 620px) {
            .zerinix-shell { padding: 24px 12px !important; }
            .zerinix-card { padding: 28px 22px !important; }
            .zerinix-title { font-size: 28px !important; line-height: 1.12 !important; }
          }
        </style>
      </head>
      <body style="margin:0;background:#020617;color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
        <div class="zerinix-shell" style="padding:42px 18px;background:linear-gradient(180deg,#020617 0%,#030712 100%);">
          <div style="max-width:640px;margin:0 auto;">
            <div style="margin-bottom:18px;color:#f8fafc;font-size:18px;font-weight:800;letter-spacing:0.08em;">ZERINIX</div>
            <div class="zerinix-card" style="background:rgba(15,23,42,0.92);border:1px solid rgba(148,163,184,0.18);border-radius:28px;padding:38px;box-shadow:0 24px 80px rgba(0,0,0,0.38);">
              <div style="color:#2dd4bf;font-size:12px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;">${escapeHtml(input.eyebrow)}</div>
              <h1 class="zerinix-title" style="margin:12px 0 0;color:#ffffff;font-size:34px;line-height:1.08;letter-spacing:-0.02em;">${escapeHtml(input.title)}</h1>
              <p style="margin:18px 0 0;color:#cbd5e1;font-size:16px;line-height:1.68;">${escapedBody}</p>
              ${renderRows(input.rows)}
              ${input.actionLabel && input.actionUrl ? renderAction(input.actionLabel, input.actionUrl) : ""}
            </div>
            <p style="margin:22px 0 0;color:#64748b;font-size:12px;line-height:1.6;">
              You received this email because this address is connected to a ZERINIX account or workspace event. If this was unexpected, contact support.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function buildTemplate(input: {
  purpose: EmailPurpose;
  subject: string;
  eyebrow: string;
  title: string;
  body: string;
  actionLabel?: string;
  actionUrl?: string;
  rows?: KeyValue[];
}): EmailTemplate {
  return {
    purpose: input.purpose,
    subject: input.subject,
    html: renderZerinixEmail(input),
    text: buildText(input),
  };
}

export function buildWelcomeEmail(input: { name?: string; workspaceUrl: string }) {
  const name = input.name?.trim() || "Founder";

  return buildTemplate({
    purpose: "welcome",
    subject: "Welcome to ZERINIX",
    eyebrow: "Welcome",
    title: `Welcome to ZERINIX, ${name}`,
    body:
      "Your AI workspace is ready. You can create business plans, run market analysis, continue strategic chats and organize investor-ready reports from one secure workspace.",
    actionLabel: "Open workspace",
    actionUrl: input.workspaceUrl,
  });
}

export function buildPasswordResetEmail(input: { resetUrl: string }) {
  return buildTemplate({
    purpose: "password_reset",
    subject: "Reset your ZERINIX password",
    eyebrow: "Account security",
    title: "Reset your password",
    body:
      "Use the secure link below to reset your ZERINIX password. If you did not request this, you can safely ignore this email.",
    actionLabel: "Reset password",
    actionUrl: input.resetUrl,
  });
}

export function buildEmailVerificationEmail(input: { verificationUrl: string }) {
  return buildTemplate({
    purpose: "email_verification",
    subject: "Verify your ZERINIX email",
    eyebrow: "Email verification",
    title: "Verify your email address",
    body:
      "Confirm this email address to keep your ZERINIX account secure and ensure important workspace notifications reach you.",
    actionLabel: "Verify email",
    actionUrl: input.verificationUrl,
  });
}

export function buildWorkspaceInvitationEmail(input: {
  inviterName?: string;
  workspaceName: string;
  invitationUrl: string;
}) {
  const inviter = input.inviterName?.trim() || "A ZERINIX workspace admin";

  return buildTemplate({
    purpose: "workspace_invitation",
    subject: `Invitation to ${input.workspaceName} on ZERINIX`,
    eyebrow: "Workspace invitation",
    title: `You have been invited to ${input.workspaceName}`,
    body: `${inviter} invited you to collaborate in a ZERINIX workspace. Accept the invitation to review reports, market analysis and strategic work in one place.`,
    actionLabel: "Open invitation",
    actionUrl: input.invitationUrl,
    rows: [{ label: "Workspace", value: input.workspaceName }],
  });
}

export function buildReportReadyEmail(input: {
  reportTitle: string;
  reportType: string;
  reportUrl: string;
}) {
  return buildTemplate({
    purpose: "report_ready",
    subject: `${input.reportTitle} is ready`,
    eyebrow: "Report ready",
    title: "Your ZERINIX report is ready",
    body:
      "The report has finished generating and is available in your workspace. Open it to review the analysis, export the PDF or continue the conversation with AI Chat.",
    actionLabel: "Open report",
    actionUrl: input.reportUrl,
    rows: [
      { label: "Report", value: input.reportTitle },
      { label: "Type", value: input.reportType },
    ],
  });
}

export function buildBillingReceiptEmail(input: {
  amount: string;
  status: string;
  invoiceUrl?: string | null;
  period?: string;
}) {
  return buildTemplate({
    purpose: "billing_receipt",
    subject: "Your ZERINIX billing receipt",
    eyebrow: "Billing",
    title: "Billing receipt",
    body:
      "A billing event was recorded for your ZERINIX subscription. You can review subscription details from the billing page.",
    actionLabel: input.invoiceUrl ? "View invoice" : undefined,
    actionUrl: input.invoiceUrl || undefined,
    rows: [
      { label: "Amount", value: input.amount },
      { label: "Status", value: input.status },
      ...(input.period ? [{ label: "Billing period", value: input.period }] : []),
    ],
  });
}

export function buildSubscriptionEmail(input: {
  plan: string;
  status: string;
  billingUrl: string;
}) {
  return buildTemplate({
    purpose: "subscription",
    subject: "ZERINIX subscription update",
    eyebrow: "Subscription",
    title: "Your subscription was updated",
    body:
      "Your ZERINIX subscription status changed. Review the latest plan and billing details from your secure billing page.",
    actionLabel: "Open billing",
    actionUrl: input.billingUrl,
    rows: [
      { label: "Plan", value: input.plan },
      { label: "Status", value: input.status },
    ],
  });
}
