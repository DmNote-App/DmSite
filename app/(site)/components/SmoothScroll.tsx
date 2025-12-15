"use client";

import { ReactNode, useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    const lenis = new Lenis({
      duration: 1.0,
      // 더 안정적인 easing - 끝에서 부드럽게 정지
      easing: (t) => {
        // easeOutQuart - 끝에서 떨림 없이 안정적으로 멈춤
        return 1 - Math.pow(1 - t, 4);
      },
      lerp: 0.1, // 보간 값 - 너무 작으면 떨림 발생
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let rafId: number | null = null;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
