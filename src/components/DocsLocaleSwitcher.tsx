"use client";

import { usePathname, useRouter } from "next/navigation";

type Locale = "en" | "ko";

function getLocaleFromPathname(pathname: string): Locale | null {
  if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
  if (pathname === "/ko" || pathname.startsWith("/ko/")) return "ko";
  return null;
}

function replaceLeadingLocale(pathname: string, nextLocale: Locale): string {
  const currentLocale = getLocaleFromPathname(pathname);
  if (!currentLocale) {
    return `/${nextLocale}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
  }
  return pathname.replace(/^\/(en|ko)(?=\/|$)/, `/${nextLocale}`);
}

export default function DocsLocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname() || "/";

  const locale = getLocaleFromPathname(pathname) ?? "ko";
  const nextLocale: Locale = locale === "ko" ? "en" : "ko";

  const toggleLocale = () => {
    // docs 미들웨어(nextra/locales)와 동일한 쿠키명을 사용
    // (사이트/문서 어디서 바꿔도 일관되게 동작)
    document.cookie = `NEXT_LOCALE=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;

    try {
      localStorage.setItem("dm-note-locale", nextLocale);
    } catch {
      // ignore
    }

    router.push(replaceLeadingLocale(pathname, nextLocale));
  };

  return (
    <button
      onClick={toggleLocale}
      className="nx-flex nx-items-center nx-gap-1.5 nx-rounded-md nx-px-2.5 nx-py-1.5 nx-text-sm nx-font-medium nx-text-gray-300 hover:nx-text-white hover:nx-bg-white/10 nx-transition-colors nx-cursor-pointer"
      aria-label={locale === "ko" ? "Switch to English" : "한국어로 전환"}
      title={locale === "ko" ? "Switch to English" : "한국어로 전환"}
      type="button"
    >
      <svg
        className="nx-h-4 nx-w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        />
      </svg>
      <span className="nx-uppercase nx-tracking-wide nx-w-6 nx-text-center">
        {locale === "ko" ? "EN" : "KO"}
      </span>
    </button>
  );
}
