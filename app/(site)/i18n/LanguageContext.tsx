"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { translations, type Locale, type Translations } from "./translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const STORAGE_KEY = "dm-note-locale";

function getInitialLocale(): Locale {
  // SSR에서는 기본값 반환
  if (typeof window === "undefined") {
    return "ko";
  }

  // 1. localStorage에서 저장된 언어 확인
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "ko" || stored === "en") {
    return stored;
  }

  // 2. 브라우저 언어 설정 확인
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("ko")) {
    return "ko";
  }

  // 3. 영어가 기본값 (한국어가 아닌 모든 언어)
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ko");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 클라이언트에서 초기 언어 설정
    const initialLocale = getInitialLocale();
    setLocaleState(initialLocale);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  };

  // 항상 같은 구조의 Provider 반환 (hydration mismatch 방지)
  const currentLocale = mounted ? locale : "ko";
  const t = translations[currentLocale];

  return (
    <LanguageContext.Provider value={{ locale: currentLocale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
