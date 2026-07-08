export function getSupabaseUrl() {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabasePublishableKey() {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function getSupabaseUrlValidationError(supabaseUrl: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(supabaseUrl);
  } catch {
    return "Invalid Supabase configuration. SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL must be a valid https://*.supabase.co URL.";
  }

  if (parsedUrl.protocol !== "https:") {
    return "Invalid Supabase configuration. Supabase URL must use https.";
  }

  if (!parsedUrl.hostname.endsWith(".supabase.co")) {
    return "Invalid Supabase configuration. Supabase URL must point to a *.supabase.co host.";
  }

  return "";
}

export function hasSupabaseConfig() {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

export function requireSupabaseConfig() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabasePublishableKey();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase configuration. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local."
    );
  }

  const supabaseUrlValidationError = getSupabaseUrlValidationError(supabaseUrl);

  if (supabaseUrlValidationError) {
    throw new Error(supabaseUrlValidationError);
  }

  return { supabaseUrl, supabaseKey };
}
