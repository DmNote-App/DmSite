"use client";

import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<any>(null);
  const rafIdRef = useRef<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [lenisReady, setLenisReady] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    // 다크 모드 스크롤바 색상 (사이트 홈은 항상 다크 테마)
    const darkGrey300 = "110 114 120";
    const darkGrey400 = "170 176 184";

    const applySiteScrollbarTheme = () => {
      // 사이트 홈은 항상 다크 테마 스크롤바를 사용 (하드코딩)
      // docs에서 라이트 모드로 전환 후 돌아와도 항상 다크 스크롤바 유지
      const thumb = `rgb(${darkGrey300})`;
      const thumbHover = `rgb(${darkGrey400})`;

      // html.dark 클래스 추가 - docs 라이트 모드에서 제거된 경우 복원
      // 이렇게 하면 globals.css의 html.dark 스크롤바 스타일이 적용됨
      if (!root.classList.contains("dark")) {
        root.classList.add("dark");
      }
      if (root.getAttribute("data-site-theme") !== "dark") {
        root.setAttribute("data-site-theme", "dark");
      }
      if (document.body?.getAttribute("data-site-theme") !== "dark") {
        document.body?.setAttribute("data-site-theme", "dark");
      }
      if (root.style.getPropertyValue("--scrollbar-thumb") !== thumb) {
        root.style.setProperty("--scrollbar-thumb", thumb);
      }
      if (root.style.getPropertyValue("--scrollbar-thumb-hover") !== thumbHover) {
        root.style.setProperty("--scrollbar-thumb-hover", thumbHover);
      }
      if (root.style.getPropertyValue("color-scheme") !== "dark") {
        root.style.setProperty("color-scheme", "dark");
      }
    };

    applySiteScrollbarTheme();

    const ua = window.navigator.userAgent;
    const isWebKit =
      /AppleWebKit/i.test(ua) && !/Chrome|Chromium|Edg|OPR/i.test(ua);
    if (isWebKit) {
      root.classList.add("webkit");
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "attributes") continue;
        if (
          mutation.attributeName === "class" ||
          mutation.attributeName === "style" ||
          mutation.attributeName === "data-theme"
        ) {
          applySiteScrollbarTheme();
          break;
        }
      }
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    return () => {
      observer.disconnect();
      root.classList.remove("webkit");
      root.removeAttribute("data-site-theme");
      if (document.body) {
        document.body.removeAttribute("data-site-theme");
      }
      root.style.removeProperty("--scrollbar-thumb");
      root.style.removeProperty("--scrollbar-thumb-hover");
      root.style.removeProperty("color-scheme");
    };
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (typeof window === "undefined") return;

    // reduced motion 체크
    try {
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
        return;
      }
    } catch {
      // matchMedia 실패 시 무시
    }

    let lenis: any = null;
    let isMounted = true;

    // 동적 import로 Lenis 로드 (SSR 안전)
    const initLenis = async () => {
      try {
        // 약간의 지연으로 DOM이 완전히 준비되도록 함
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!isMounted) return;

        const LenisModule = await import("lenis");
        const Lenis = LenisModule.default;

        if (!isMounted) return;

        // 이전 인스턴스 정리
        if (lenisRef.current) {
          lenisRef.current.destroy();
          lenisRef.current = null;
        }
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }

        lenis = new Lenis({
          duration: 1.0,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
          lerp: 0.1,
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
        });

        lenisRef.current = lenis;
        setLenisReady(true);

        function raf(time: number) {
          if (lenisRef.current) {
            lenisRef.current.raf(time);
          }
          rafIdRef.current = requestAnimationFrame(raf);
        }

        rafIdRef.current = requestAnimationFrame(raf);
      } catch (error) {
        // Lenis 로드 실패 시 조용히 실패 - 스무스 스크롤 없이 정상 작동
        console.warn(
          "Lenis initialization failed, falling back to native scroll:",
          error
        );
        setLenisReady(true); // 실패해도 children 렌더링 진행
      }
    };

    initLenis();

    return () => {
      isMounted = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [isClient]);

  return <>{children}</>;
}
