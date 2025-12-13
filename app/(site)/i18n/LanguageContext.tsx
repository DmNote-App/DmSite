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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 클라이언트에서 초기 언어 설정
    const initialLocale = getInitialLocale();
    setLocaleState(initialLocale);
    setIsInitialized(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  };

  const t = translations[locale];

  // hydration mismatch 방지를 위해 초기화 전에는 기본값 사용
  if (!isInitialized) {
    return (
      <LanguageContext.Provider
        value={{ locale: "ko", setLocale, t: translations.ko }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
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
