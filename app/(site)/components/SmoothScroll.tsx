"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<any>(null);
  const rafIdRef = useRef<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [lenisReady, setLenisReady] = useState(false);

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
