const primaryAllowedEmail = [
  "yesilovaibrahim38",
  ["gmail", "com"].join("."),
].join("@");
const primaryDeveloperHandle = ["iyslv94", "coder"].join("-");

const allowedBetaEmails = new Set([primaryAllowedEmail]);
const allowedDeveloperHandles = new Set([primaryDeveloperHandle]);

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

function normalizeHandle(value: string) {
  return value.trim().toLowerCase();
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

function collectAccountHandles(account: BetaAccessAccount) {
  const handles = new Set<string>();
  const addHandle = (value: unknown) => {
    const handle = readString(value);

    if (handle) {
      handles.add(normalizeHandle(handle));
    }
  };

  addHandle(account.user_metadata?.user_name);
  addHandle(account.user_metadata?.preferred_username);
  addHandle(account.user_metadata?.name);
  addHandle(account.app_metadata?.user_name);
  addHandle(account.app_metadata?.preferred_username);

  account.identities?.forEach((identity) => {
    addHandle(identity.identity_data?.user_name);
    addHandle(identity.identity_data?.preferred_username);
    addHandle(identity.identity_data?.name);
  });

  return handles;
}

export function isPrivateBetaAllowed(account?: BetaAccessAccount | string | null) {
  if (!account) {
    return false;
  }

  const betaAccount = typeof account === "string" ? { email: account } : account;
  const accountEmails = collectAccountEmails(betaAccount);
  const accountHandles = collectAccountHandles(betaAccount);

  for (const email of allowedBetaEmails) {
    if (
      accountEmails.has(normalizeEmail(email)) ||
      accountEmails.has(normalizeGmailAddress(email))
    ) {
      return true;
    }
  }

  for (const handle of allowedDeveloperHandles) {
    if (accountHandles.has(normalizeHandle(handle))) {
      return true;
    }
  }

  return false;
}
