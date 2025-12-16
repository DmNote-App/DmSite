"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface ScrollProgress {
  // 전체 페이지 스크롤 진행률 (0~1)
  progress: number;
  // 현재 스크롤 위치 (px)
  scrollY: number;
  // 스크롤 방향 ('up' | 'down' | null)
  direction: "up" | "down" | null;
  // 뷰포트 높이
  viewportHeight: number;
  // 문서 전체 높이
  documentHeight: number;
}

export function useScrollProgress(): ScrollProgress {
  const [scrollData, setScrollData] = useState<ScrollProgress>({
    progress: 0,
    scrollY: 0,
    direction: null,
    viewportHeight: 0,
    documentHeight: 0,
  });

  const lastScrollY = useRef(0);

  const updateScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const maxScroll = documentHeight - viewportHeight;
    const progress = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;

    const direction =
      scrollY > lastScrollY.current
        ? "down"
        : scrollY < lastScrollY.current
        ? "up"
        : null;

    lastScrollY.current = scrollY;

    setScrollData({
      progress,
      scrollY,
      direction,
      viewportHeight,
      documentHeight,
    });
  }, []);

  useEffect(() => {
    let localRafId: number | null = null;
    
    const handleScroll = () => {
      if (localRafId) {
        cancelAnimationFrame(localRafId);
      }
      localRafId = requestAnimationFrame(updateScroll);
    };

    // 초기값 설정
    updateScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (localRafId) {
        cancelAnimationFrame(localRafId);
        localRafId = null;
      }
    };
  }, [updateScroll]);

  return scrollData;
}

// 특정 섹션의 스크롤 진행률을 계산하는 훅
export function useSectionProgress(
  sectionRef: React.RefObject<HTMLElement | null>,
  offset: { start?: number; end?: number } = {}
) {
  const [progress, setProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // 섹션이 뷰포트에 들어왔는지 확인
        const startOffset = offset.start ?? 0;
        const endOffset = offset.end ?? 0;

        const sectionTop = rect.top - viewportHeight + startOffset;
        const sectionHeight = rect.height + viewportHeight - startOffset - endOffset;

        // 진행률 계산 (0: 섹션 시작, 1: 섹션 끝)
        const currentProgress = Math.max(0, Math.min(1, -sectionTop / sectionHeight));

        setProgress(currentProgress);
        setIsInView(rect.top < viewportHeight && rect.bottom > 0);
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [sectionRef, offset.start, offset.end]);

  return { progress, isInView };
}
