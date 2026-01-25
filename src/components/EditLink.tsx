"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function EditLinkFixer() {
  const pathname = usePathname();

  useEffect(() => {
    const match = pathname.match(/^\/(ko|en)\/docs(?:\/(.*))?\/?$/);
    if (!match) return;

    const lang = match[1];
    const rest = (match[2] ?? "").replace(/^\/+|\/+$/g, "");

    let cleanPath = "page.mdx";
    if (rest) {
      cleanPath = rest.endsWith(".mdx") ? rest : `${rest}/page.mdx`;
    }

    const newHref = `https://github.com/DmNote-App/DmNote/tree/master/docs/content/${lang}/${cleanPath}`;

    // Nextra의 "Edit this page" 링크를 찾아 href를 수정합니다.
    const links = document.querySelectorAll("a");
    for (const link of links) {
      if (
        link.textContent?.includes("Edit this page") ||
        link.textContent?.includes("이 페이지 수정하기")
      ) {
        link.href = newHref;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    }
  }, [pathname]);

  return null;
}
