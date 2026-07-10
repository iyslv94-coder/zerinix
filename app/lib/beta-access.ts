import { isFounderEmail } from "@/app/lib/founder-access.mjs";

type BetaAccessIdentity = {
  identity_data?: Record<string, unknown> | null;
};

type BetaAccessAccount = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
  identities?: BetaAccessIdentity[] | null;
};

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeGmailAddress(value: string) {
  const email = normalizeEmail(value);
  const [localPart, domain] = email.split("@");

  if (!localPart || (domain !== "gmail.com" && domain !== "googlemail.com")) {
    return email;
  }

  return `${localPart.split("+")[0].replace(/\./g, "")}@gmail.com`;
}

function collectAccountEmails(account: BetaAccessAccount) {
  const emails = new Set<string>();
  const addEmail = (value: unknown) => {
    const email = readString(value);

    if (email) {
      emails.add(normalizeEmail(email));
      emails.add(normalizeGmailAddress(email));
    }
  };

  addEmail(account.email);
  addEmail(account.user_metadata?.email);
  addEmail(account.app_metadata?.email);

  account.identities?.forEach((identity) => {
    addEmail(identity.identity_data?.email);
  });

  return emails;
}

export function isPrivateBetaAllowed(account?: BetaAccessAccount | string | null) {
  return Boolean(account);
}

export function isFounderAccount(account?: BetaAccessAccount | string | null) {
  if (!account) {
    return false;
  }

  const betaAccount = typeof account === "string" ? { email: account } : account;
  const accountEmails = collectAccountEmails(betaAccount);

  return [...accountEmails].some((email) => isFounderEmail(email));
}
