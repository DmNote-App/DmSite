import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { ScrollRestorationScript } from "./ScrollRestorationScript";
import { LanguageProvider } from "./i18n";

import "./site.css";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ScrollRestorationScript />
      <Navbar />
      {children}
    </LanguageProvider>
  );
}
