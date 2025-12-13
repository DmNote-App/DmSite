"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, ReactNode } from "react";

interface SectionTransitionProps {
  children: ReactNode;
  fromColor?: string;
  toColor?: string;
  className?: string;
}

// 섹션 간 배경 전환 효과
export function SectionTransition({
  children,
  fromColor = "#050507",
  toColor = "#0a0a0c",
  className = "",
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // 배경색 전환 (그라데이션으로 부드럽게)
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* 전환 오버레이 */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`,
          opacity,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface HeroScrollEffectProps {
  children: ReactNode;
  className?: string;
}

// 히어로 섹션 스크롤 시 효과 (스케일 다운 + 페이드 아웃)
export function HeroScrollEffect({ children, className = "" }: HeroScrollEffectProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // 스크롤 시 약간 스케일 다운 + 불투명도 감소
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // 스프링 설정 최적화 - 높은 damping으로 떨림 방지
  const springConfig = { stiffness: 300, damping: 50, restDelta: 0.001 };
  const smoothScale = useSpring(scale, springConfig);
  const smoothOpacity = useSpring(opacity, springConfig);
  const smoothY = useSpring(y, springConfig);

  return (
    <motion.div
      ref={ref}
      style={{
        scale: smoothScale,
        opacity: smoothOpacity,
        y: smoothY,
      }}
      className={`${className} will-change-[transform,opacity]`}
    >
      {children}
    </motion.div>
  );
}

interface ScrollProgressBarProps {
  className?: string;
  color?: string;
}

// 스크롤 진행 표시기
export function ScrollProgressBar({
  className = "",
  color = "linear-gradient(to right, #22d3ee, #818cf8, #c084fc, #f472b6)",
}: ScrollProgressBarProps) {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 50,
    restDelta: 0.0001,
  });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-[2px] origin-left z-50 ${className}`}
      style={{
        scaleX,
        background: color,
      }}
    />
  );
}

interface BackgroundMorphProps {
  children: ReactNode;
  className?: string;
}

// 배경 모프 효과 (히어로 → 피처 섹션 전환)
export function BackgroundMorph({ children, className = "" }: BackgroundMorphProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // 배경 블러 효과 증가
  const blur = useTransform(scrollYProgress, [0, 0.5], [0, 20]);
  // 배경 효과 이동
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  // 그리드 opacity
  const gridOpacity = useTransform(scrollYProgress, [0, 0.5], [0.06, 0]);

  // 스프링 설정 최적화 - 높은 damping으로 떨림 방지
  const springConfig = { stiffness: 300, damping: 50, restDelta: 0.001 };
  const smoothBlur = useSpring(blur, springConfig);
  const smoothBgY = useSpring(bgY, springConfig);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* 패럴랙스 배경 효과 */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          y: smoothBgY,
          filter: useTransform(smoothBlur, (v) => `blur(${v}px)`),
        }}
      >
        {/* 원형 그라디언트 효과 */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#22d3ee]/20 rounded-full blur-[80px] animate-pulse-slow transform-gpu" />
        <div className="absolute top-[10%] left-[50%] transform -translate-x-1/2 w-[70%] h-[70%] bg-gradient-to-b from-[#818cf8]/10 via-[#f472b6]/10 to-transparent blur-[70px] transform-gpu" />
      </motion.div>

      {/* 그리드 패턴 */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          maskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 70%)",
          opacity: gridOpacity,
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface FeatureSectionRevealProps {
  children: ReactNode;
  className?: string;
}

// 피처 섹션 등장 효과
export function FeatureSectionReveal({
  children,
  className = "",
}: FeatureSectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start center"],
  });

  // 위로 슬라이드 + 페이드 인
  const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);

  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });
  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={ref}
      style={{
        y: smoothY,
        opacity: smoothOpacity,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
