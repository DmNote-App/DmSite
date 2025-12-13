"use client";

import { useLanguage } from "./LanguageContext";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const toggleLocale = () => {
    setLocale(locale === "ko" ? "en" : "ko");
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
      aria-label={locale === "ko" ? "Switch to English" : "한국어로 전환"}
      title={locale === "ko" ? "Switch to English" : "한국어로 전환"}
    >
      <svg
        className="w-4 h-4"
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
      <span className="uppercase tracking-wide">{locale === "ko" ? "EN" : "KO"}</span>
    </button>
  );
}
