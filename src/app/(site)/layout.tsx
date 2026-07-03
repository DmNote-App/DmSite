import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { ScrollRestorationScript } from "./ScrollRestorationScript";
import { LanguageProvider } from "./i18n";
import SmoothScroll from "@/components/SmoothScroll";

import "./site.css";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      {/* JS 미실행 시 리빌 요소가 안 보이는 문제 방지 */}
      <noscript>
        <style>{`.site-theme .reveal{opacity:1!important;transform:none!important;filter:none!important}`}</style>
      </noscript>
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
