import { defaultLocale, type AppLocale } from "./config";
import { getDictionary } from "./dictionaries";

export async function getRequestLocale(): Promise<AppLocale> {
  return defaultLocale;
}

export async function getRequestDictionary() {
  const locale = await getRequestLocale();

  return {
    locale,
    dictionary: getDictionary(locale),
  };
}
