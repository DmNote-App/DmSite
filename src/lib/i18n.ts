export const locales = ["en", "ko"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ko";

export function isLocale(value: unknown): value is Locale {
  return value === "ko" || value === "en";
}

export function homePath(locale: Locale): string {
  return locale === "ko" ? "/" : "/en/";
}

export function docsPath(locale: Locale, slug = ""): string {
  const path = slug.replace(/^\/+|\/+$/g, "");
  return `/${locale}/docs/${path ? `${path}/` : ""}`;
}

export function localizeDocsHref(href: string, locale: Locale): string {
  if (!/^\/docs(?:\/|[?#]|$)/.test(href)) return href;
  const [, pathname, suffix] = href.match(/^([^?#]*)(.*)$/)!;
  const slug = pathname.replace(/^\/docs\/?/, "").replace(/\/$/, "");
  const canonicalSlug = slug === "api-reference/index" ? "api-reference" : slug;
  return `${docsPath(locale, canonicalSlug)}${suffix}`;
}

export function getLocale(headers: Headers): Locale {
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

  for (const lang of langs) {
    if (isLocale(lang.code) && lang.priority > 0) {
      return lang.code;
    }
  }

  return "ko";
}
