import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";

import "./fonts/static/pretendard-jp.css";
import "./recap.css";
import "./recap-tailwind.css";
import RecapProviders from "./providers";
import RecapStyleScope from "./RecapStyleScope";

export const metadata: Metadata = {
  title: "DM Note - V-ARCHIVE Recap",
  description: "한 해 동안의 기록을 되돌아보는 시간",
};

const themeInitScript = `
(function() {
  try {
    var root = document.documentElement;
    if (!root.dataset.recapPrevTheme) {
      root.dataset.recapPrevTheme = root.dataset.theme || "";
      root.dataset.recapPrevDark = root.classList.contains("dark") ? "1" : "0";
      root.dataset.recapPrevColorScheme = root.style.colorScheme || "";
    }
    var key = "recap-theme";
    var stored = localStorage.getItem(key);
    var theme = stored === "dark" ? "dark" : "light";
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export default function RecapLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script
        id="recap-theme-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: themeInitScript }}
      />
      <RecapStyleScope />
      <RecapProviders>{children}</RecapProviders>
    </>
  );
}
