"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function EditLinkFixer() {
  const pathname = usePathname();

  useEffect(() => {
    // pathname에서 /docs/ 이후의 경로를 추출하고 page.mdx를 붙임
    let cleanPath = pathname.replace(/^\/docs\/?/, "") || "page.mdx";
    if (cleanPath && !cleanPath.endsWith(".mdx")) {
      cleanPath += "/page.mdx";
    }
    if (cleanPath === "/") {
      cleanPath = "page.mdx";
    }

    const newHref = `https://github.com/DmNote-App/DmNote/tree/master/docs/plugin/${cleanPath}`;

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
