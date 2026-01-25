// Locale detection utility for i18n
export function getLocale(headers: Headers): string {
  const acceptLang = headers.get("accept-language");
  if (!acceptLang) return "ko";

  const langs = acceptLang.split(",").map((lang) => {
    const [code, priority = "q=1"] = lang.trim().split(";");
    return {
      code: code.split("-")[0].toLowerCase(),
      priority: parseFloat(priority.replace("q=", "")),
    };
  });

  langs.sort((a, b) => b.priority - a.priority);

  const supportedLocales = ["en", "ko"];
  for (const lang of langs) {
    if (supportedLocales.includes(lang.code)) {
      return lang.code;
    }
  }

  return "ko";
}

export const locales = ["en", "ko"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ko";
