import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { ScrollRestorationScript } from "./ScrollRestorationScript";
import { LanguageProvider } from "./i18n";
import SmoothScroll from "@/components/SmoothScroll";

import "./site.css";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <div className="site-theme dark min-h-screen bg-canvas text-grey-900">
        <SmoothScroll>
          <ScrollRestorationScript />
          <Navbar />
          {children}
        </SmoothScroll>
      </div>
    </LanguageProvider>
  );
}
