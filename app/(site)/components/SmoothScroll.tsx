"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<any>(null);
  const rafIdRef = useRef<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)
      return;

    let lenis: any = null;

    // 동적 import로 Lenis 로드 (SSR 안전)
    const initLenis = async () => {
      try {
        const Lenis = (await import("lenis")).default;

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

        function raf(time: number) {
          if (lenisRef.current) {
            lenisRef.current.raf(time);
          }
          rafIdRef.current = requestAnimationFrame(raf);
        }

        rafIdRef.current = requestAnimationFrame(raf);
      } catch (error) {
        console.warn("Lenis initialization failed:", error);
      }
    };

    initLenis();

    return () => {
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
