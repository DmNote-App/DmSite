"use client";

import { createContext, useContext, type ReactNode } from "react";
import { translations, type Locale, type Translations } from "./translations";

type LanguageContextType = { locale: Locale; t: Translations };
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, locale }: {
  children: ReactNode;
  locale: Locale;
}) {
  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale] }}>
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
