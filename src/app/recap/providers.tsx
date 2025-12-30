"use client";

import type Lenis from "lenis";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ThemeProvider } from "@/context/theme";
import ThemeToggle from "@/components/ThemeToggle";

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mediaQuery.matches);
    update();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", update);
      return () => mediaQuery.removeEventListener("change", update);
    }
    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  return prefersReducedMotion;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false, // 이미 캐시된 데이터가 있으면 재요청 안함
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
            gcTime: 30 * 60 * 1000, // 30분간 캐시 유지
          },
        },
      })
  );
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasNickname = Boolean(searchParams?.get("nickname"));
  const prefersReducedMotion = usePrefersReducedMotion();
  const isRecapHome = pathname === "/recap" || pathname === "/recap/";

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    if (isRecapHome && !hasNickname) {
      return;
    }

    let lenis: Lenis | null = null;
    let rafId: number | null = null;
    let cancelled = false;
    let lastActivity = 0;
    const idleDelay = 160;

    const scheduleRaf = () => {
      if (rafId !== null || cancelled || !lenis) return;
      rafId = requestAnimationFrame(raf);
    };

    const raf = (time: number) => {
      if (!lenis) return;
      lenis.raf(time);
      const now = performance.now();
      const isActive = lenis.isScrolling !== false;

      if (isActive) {
        lastActivity = now;
      }

      if (isActive || now - lastActivity < idleDelay) {
        rafId = requestAnimationFrame(raf);
        return;
      }

      rafId = null;
    };

    const markActivity = () => {
      lastActivity = performance.now();
      scheduleRaf();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        return;
      }
      markActivity();
    };

    const start = async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) return;
      lenis = new Lenis();
      lastActivity = performance.now();
      scheduleRaf();
      lenis.on("scroll", markActivity);
      window.addEventListener("wheel", markActivity, { passive: true });
      window.addEventListener("touchstart", markActivity, { passive: true });
      window.addEventListener("touchmove", markActivity, { passive: true });
      window.addEventListener("keydown", markActivity);
      document.addEventListener("visibilitychange", handleVisibilityChange);
    };

    void start();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("wheel", markActivity);
      window.removeEventListener("touchstart", markActivity);
      window.removeEventListener("touchmove", markActivity);
      window.removeEventListener("keydown", markActivity);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      lenis?.off?.("scroll", markActivity);
      lenis?.destroy();
    };
  }, [isRecapHome, hasNickname, prefersReducedMotion]);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ThemeToggle />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
