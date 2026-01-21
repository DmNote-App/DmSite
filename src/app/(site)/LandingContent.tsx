"use client";

import { useLanguage } from "./i18n";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  ScrollProgressBar,
  HeroScrollEffect,
  FeatureSectionReveal,
} from "@/components/SectionTransitions";
import { Parallax, ScrollFade } from "@/components/ScrollAnimations";

// 로딩 플레이스홀더 컴포넌트
function LoadingPlaceholder() {
  return (
    <div className="dark">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ backgroundColor: "#08080a" }}
      />
      <div className="min-h-screen" />
    </div>
  );
}

// 메인 콘텐츠 컴포넌트 (모든 훅이 여기서 실행)
function LandingContentInner() {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  // 전체 페이지 스크롤 진행률
  const { scrollYProgress } = useScroll();

  // 히어로 섹션 스크롤
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // 피처 섹션 스크롤 (등장용)
  const { scrollYProgress: featuresScrollProgress } = useScroll({
    target: featuresRef,
    offset: ["start end", "start start"],
  });

  // 피처 섹션 퇴장 스크롤 (2페이지 → 3페이지 전환)
  const { scrollYProgress: featuresExitProgress } = useScroll({
    target: featuresRef,
    offset: ["end end", "end start"],
  });

  // 배경 효과 애니메이션 값 - useTransform만 사용하여 성능 최적화
  const gridOpacity = useTransform(heroScrollProgress, [0, 0.5], [0.06, 0]);
  const heroOpacity = useTransform(
    heroScrollProgress,
    [0, 0.5, 0.8],
    [1, 0.6, 0]
  );
  const heroScale = useTransform(heroScrollProgress, [0, 0.8], [1, 0.9]);

  // 스프링 설정 - Hero/Features 메인 애니메이션만 적용 (반복 컴포넌트는 제외)
  const springConfig = { stiffness: 300, damping: 50, restDelta: 0.001 };
  const smoothHeroOpacity = useSpring(heroOpacity, springConfig);
  const smoothHeroScale = useSpring(heroScale, springConfig);

  // Features 섹션 퇴장 애니메이션 값 (2페이지 → 3페이지)
  const featuresOpacity = useTransform(
    featuresExitProgress,
    [0, 0.5, 0.8],
    [1, 0.6, 0]
  );
  const featuresScale = useTransform(featuresExitProgress, [0, 0.8], [1, 0.9]);
  const smoothFeaturesOpacity = useSpring(featuresOpacity, springConfig);
  const smoothFeaturesScale = useSpring(featuresScale, springConfig);

  return (
    <div className="dark">
      {/* 스크롤 진행 표시기 */}
      <ScrollProgressBar />

      {/* 단일 고정 배경 */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ backgroundColor: "#08080a" }}
      />

      {/* 노이즈 오버레이 - 밴딩 방지 디더링 (정적 base64 노이즈, GPU 가속) */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAAElBMVEUAAAAAAAAAAAAAAAAAAAAAAADgKxmiAAAABnRSTlMCCgkGBAUmfekYAAAASklEQVQ4y2MgFjCCgCMYOIGBMxg4g4ELGLiAgSsYuIKBGxi4gYE7GLiDgQcYeICBJxh4goEXGHiBgTcYeIOBDxj4gIEvGPgSBQBU7hjnIPLcYAAAAABJRU5ErkJggg==")`,
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative z-10 text-white font-sans overflow-x-hidden w-full selection:bg-accent-500 selection:text-white">
        {/* Hero Section with Background Effects */}
        <section
          ref={heroRef}
          className="relative overflow-hidden isolate"
          style={{ contain: "layout paint", minHeight: "100dvh" }}
        >
          {/* 배경 그라데이션 효과 - SVG로 밴딩 방지 */}
          <svg
            className="absolute inset-0 w-full h-full z-0 pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* 중앙 상단 메인 글로우 - 보라 */}
              <radialGradient
                id="hero-glow-center"
                cx="50%"
                cy="0%"
                r="70%"
                fx="50%"
                fy="0%"
              >
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#818cf8" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
              </radialGradient>
              {/* 좌측 청록 */}
              <radialGradient
                id="hero-glow-left"
                cx="0%"
                cy="30%"
                r="60%"
                fx="0%"
                fy="30%"
              >
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.12" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </radialGradient>
              {/* 우측 핑크 */}
              <radialGradient
                id="hero-glow-right"
                cx="100%"
                cy="30%"
                r="60%"
                fx="100%"
                fy="30%"
              >
                <stop offset="0%" stopColor="#f472b6" stopOpacity="0.10" />
                <stop offset="50%" stopColor="#f472b6" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-glow-center)" />
            <rect width="100%" height="100%" fill="url(#hero-glow-left)" />
            <rect width="100%" height="100%" fill="url(#hero-glow-right)" />
          </svg>

          {/* Grid Pattern with Radial Fade - 스크롤 시 페이드 아웃 */}
          <motion.div
            className="absolute inset-0 z-0 pointer-events-none will-change-opacity"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "50px 50px",
              maskImage:
                "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 70%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 60% 60% at 50% 50%, black 20%, transparent 70%)",
              opacity: gridOpacity,
              contain: "strict",
            }}
          />

          {/* Main Content - 스크롤 시 스케일 다운 + 페이드 아웃 */}
          <motion.main
            className="relative z-10 flex flex-col items-center justify-center max-w-7xl mx-auto px-[30px] sm:px-6 pt-16 pb-24 will-change-[transform,opacity]"
            style={{
              opacity: smoothHeroOpacity,
              scale: smoothHeroScale,
              minHeight: "100dvh",
            }}
          >
            {/* Text Content */}
            <div className="w-full text-center space-y-8 md:space-y-10 max-w-4xl mx-auto z-20 flex flex-col justify-center">
              <div className="space-y-8">
                <ScrollFade delay={0.1} distance={40}>
                  <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                      {t.hero.title} <br className="md:hidden" />
                      <span
                        className="gradient-text"
                        data-text={t.hero.titleHighlight}
                      >
                        {t.hero.titleHighlight}
                      </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                      {t.hero.description}
                      <br />
                      {t.hero.descriptionSub}
                    </p>
                  </div>
                </ScrollFade>

                <ScrollFade delay={0.2} distance={50}>
                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                    <a
                      href="https://github.com/DmNote-App/DmNote/releases/latest"
                      target="_blank"
                      rel="noreferrer"
                      className="group relative w-full sm:w-40 h-14 bg-white text-black rounded-xl font-bold text-lg overflow-hidden flex items-center justify-center gap-2 hover:scale-105 hover:bg-gray-100 transition duration-300"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      {t.hero.download}
                    </a>

                    <a
                      href="https://github.com/DmNote-App/DmNote/releases"
                      target="_blank"
                      rel="noreferrer"
                      className="glass-effect w-full sm:w-40 h-14 rounded-xl font-medium text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white transition hover:border-white/20 flex items-center justify-center"
                    >
                      {t.hero.release}
                    </a>
                  </div>
                </ScrollFade>

                {/* Tech Stack */}
                <ScrollFade delay={0.3} distance={60}>
                  <div className="flex items-center justify-center gap-6 pt-4">
                    <TechStackIcon
                      name="React"
                      hoverColor="#61DAFB"
                      icon={
                        <svg
                          className="w-5 h-5 mb-[3px]"
                          viewBox="0 14 128 100"
                          fill="currentColor"
                        >
                          <g>
                            <circle cx="64" cy="64" r="11.4" />
                            <path d="M107.3 45.2c-2.2-.8-4.5-1.6-6.9-2.3.6-2.4 1.1-4.8 1.5-7.1 2.1-13.2-.2-22.5-6.6-26.1-1.9-1.1-4-1.6-6.4-1.6-7 0-15.9 5.2-24.9 13.9-9-8.7-17.9-13.9-24.9-13.9-2.4 0-4.5.5-6.4 1.6-6.4 3.7-8.7 13-6.6 26.1.4 2.3.9 4.7 1.5 7.1-2.4.7-4.7 1.4-6.9 2.3C8.2 50 1.4 56.6 1.4 64s6.9 14 19.3 18.8c2.2.8 4.5 1.6 6.9 2.3-.6 2.4-1.1 4.8-1.5 7.1-2.1 13.2.2 22.5 6.6 26.1 1.9 1.1 4 1.6 6.4 1.6 7.1 0 16-5.2 24.9-13.9 9 8.7 17.9 13.9 24.9 13.9 2.4 0 4.5-.5 6.4-1.6 6.4-3.7 8.7-13 6.6-26.1-.4-2.3-.9-4.7-1.5-7.1 2.4-.7 4.7-1.4 6.9-2.3 12.5-4.8 19.3-11.4 19.3-18.8s-6.8-14-19.3-18.8zM92.5 14.7c4.1 2.4 5.5 9.8 3.8 20.3-.3 2.1-.8 4.3-1.4 6.6-5.2-1.2-10.7-2-16.5-2.5-3.4-4.8-6.9-9.1-10.4-13 7.4-7.3 14.9-12.3 21-12.3 1.3 0 2.5.3 3.5.9zM81.3 74c-1.8 3.2-3.9 6.4-6.1 9.6-3.7.3-7.4.4-11.2.4-3.9 0-7.6-.1-11.2-.4-2.2-3.2-4.2-6.4-6-9.6-1.9-3.3-3.7-6.7-5.3-10 1.6-3.3 3.4-6.7 5.3-10 1.8-3.2 3.9-6.4 6.1-9.6 3.7-.3 7.4-.4 11.2-.4 3.9 0 7.6.1 11.2.4 2.2 3.2 4.2 6.4 6 9.6 1.9 3.3 3.7 6.7 5.3 10-1.7 3.3-3.4 6.6-5.3 10zm8.3-3.3c1.5 3.5 2.7 6.9 3.8 10.3-3.4.8-7 1.4-10.8 1.9 1.2-1.9 2.5-3.9 3.6-6 1.2-2.1 2.3-4.2 3.4-6.2zM64 97.8c-2.4-2.6-4.7-5.4-6.9-8.3 2.3.1 4.6.2 6.9.2 2.3 0 4.6-.1 6.9-.2-2.2 2.9-4.5 5.7-6.9 8.3zm-18.6-15c-3.8-.5-7.4-1.1-10.8-1.9 1.1-3.3 2.3-6.8 3.8-10.3 1.1 2 2.2 4.1 3.4 6.1 1.2 2.2 2.4 4.1 3.6 6.1zm-7-25.5c-1.5-3.5-2.7-6.9-3.8-10.3 3.4-.8 7-1.4 10.8-1.9-1.2 1.9-2.5 3.9-3.6 6-1.2 2.1-2.3 4.2-3.4 6.2zM64 30.2c2.4 2.6 4.7 5.4 6.9 8.3-2.3-.1-4.6-.2-6.9-.2-2.3 0-4.6.1-6.9.2 2.2-2.9 4.5-5.7 6.9-8.3zm22.2 21l-3.6-6c3.8.5 7.4 1.1 10.8 1.9-1.1 3.3-2.3 6.8-3.8 10.3-1.1-2.1-2.2-4.2-3.4-6.2zM31.7 35c-1.7-10.5-.3-17.9 3.8-20.3 1-.6 2.2-.9 3.5-.9 6 0 13.5 4.9 21 12.3-3.5 3.8-7 8.2-10.4 13-5.8.5-11.3 1.4-16.5 2.5-.6-2.3-1-4.5-1.4-6.6zM7 64c0-4.7 5.7-9.7 15.7-13.4 2-.8 4.2-1.5 6.4-2.1 1.6 5 3.6 10.3 6 15.6-2.4 5.3-4.5 10.5-6 15.5C15.3 75.6 7 69.6 7 64zm28.5 49.3c-4.1-2.4-5.5-9.8-3.8-20.3.3-2.1.8-4.3 1.4-6.6 5.2 1.2 10.7 2 16.5 2.5 3.4 4.8 6.9 9.1 10.4 13-7.4 7.3-14.9 12.3-21 12.3-1.3 0-2.5-.3-3.5-.9zM96.3 93c1.7 10.5.3 17.9-3.8 20.3-1 .6-2.2.9-3.5.9-6 0-13.5-4.9-21-12.3 3.5-3.8 7-8.2 10.4-13 5.8-.5 11.3-1.4 16.5-2.5.6 2.3 1 4.5 1.4 6.6zm9-15.6c-2 .8-4.2 1.5-6.4 2.1-1.6-5-3.6-10.3-6-15.6 2.4-5.3 4.5-10.5 6-15.5 13.8 4 22.1 10 22.1 15.6 0 4.7-5.8 9.7-15.7 13.4z" />
                          </g>
                        </svg>
                      }
                    />

                    <TechStackIcon
                      name="TypeScript"
                      hoverColor="#3178C6"
                      icon={
                        <svg
                          className="w-5 h-5 mb-[3px]"
                          viewBox="0 0 128 128"
                          fill="currentColor"
                        >
                          <path d="M1.5 63.91v62.5h125v-125H1.5zm100.73-5a15.56 15.56 0 017.82 4.5 20.58 20.58 0 013 4c0 .16-5.4 3.81-8.69 5.85-.12.08-.6-.44-1.13-1.23a7.09 7.09 0 00-5.87-3.53c-3.79-.26-6.23 1.73-6.21 5a4.58 4.58 0 00.54 2.34c.83 1.73 2.38 2.76 7.24 4.86 8.95 3.85 12.78 6.39 15.16 10 2.66 4 3.25 10.46 1.45 15.24-2 5.2-6.9 8.73-13.83 9.9a38.32 38.32 0 01-9.52-.1 23 23 0 01-12.72-6.63c-1.15-1.27-3.39-4.58-3.25-4.82a9.34 9.34 0 011.15-.73L82 101l3.59-2.08.75 1.11a16.78 16.78 0 004.74 4.54c4 2.1 9.46 1.81 12.16-.62a5.43 5.43 0 00.69-6.92c-1-1.39-3-2.56-8.59-5-6.45-2.78-9.23-4.5-11.77-7.24a16.48 16.48 0 01-3.43-6.25 25 25 0 01-.22-8c1.33-6.23 6-10.58 12.82-11.87a31.66 31.66 0 019.49.26zm-29.34 5.24v5.12H56.66v46.23H45.15V69.26H28.88v-5a49.19 49.19 0 01.12-5.17C29.08 59 39 59 51 59h21.83z" />
                        </svg>
                      }
                    />

                    <TechStackIcon
                      name="Tauri"
                      hoverColor="#FFC131"
                      icon={
                        <svg
                          className="w-5 h-5 mb-[3px]"
                          viewBox="0 0 128 128"
                          fill="currentColor"
                        >
                          <path d="M86.242 46.547a12.19 12.19 0 0 1-24.379 0c0-6.734 5.457-12.191 12.191-12.191a12.19 12.19 0 0 1 12.188 12.191zm0 0" />
                          <path d="M41.359 81.453a12.19 12.19 0 1 1 24.383 0c0 6.734-5.457 12.191-12.191 12.191S41.36 88.187 41.36 81.453zm0 0" />
                          <path d="M99.316 85.637a46.5 46.5 0 0 1-16.059 6.535 32.675 32.675 0 0 0 1.797-10.719 33.3 33.3 0 0 0-.242-4.02 32.69 32.69 0 0 0 6.996-3.418 32.7 32.7 0 0 0 12.066-14.035 32.71 32.71 0 0 0-21.011-44.934 32.72 32.72 0 0 0-33.91 10.527 32.85 32.85 0 0 0-1.48 1.91 54.32 54.32 0 0 0-17.848 5.184A46.536 46.536 0 0 1 60.25 2.094a46.53 46.53 0 0 1 26.34-.375c8.633 2.418 16.387 7.273 22.324 13.984s9.813 15 11.16 23.863a46.537 46.537 0 0 1-20.758 46.071zM30.18 41.156l11.41 1.402a32.44 32.44 0 0 1 1.473-6.469 46.44 46.44 0 0 0-12.883 5.066zm0 0" />
                          <path d="M28.207 42.363a46.49 46.49 0 0 1 16.188-6.559 32.603 32.603 0 0 0-2.004 11.297 32.56 32.56 0 0 0 .188 3.512 32.738 32.738 0 0 0-6.859 3.371A32.7 32.7 0 0 0 23.652 68.02c-2.59 5.742-3.461 12.113-2.52 18.34s3.668 12.051 7.844 16.77 9.617 8.129 15.684 9.824 12.496 1.605 18.512-.262a32.72 32.72 0 0 0 15.402-10.266 34.9 34.9 0 0 0 1.484-1.918 54.283 54.283 0 0 0 17.855-5.223 46.528 46.528 0 0 1-8.723 16.012 46.511 46.511 0 0 1-21.918 14.609 46.53 46.53 0 0 1-26.34.375 46.6 46.6 0 0 1-22.324-13.984A46.56 46.56 0 0 1 7.453 88.434a46.53 46.53 0 0 1 3.582-26.098 46.533 46.533 0 0 1 17.172-19.973zm69.074 44.473c-.059.035-.121.066-.18.102.059-.035.121-.066.18-.102zm0 0" />
                        </svg>
                      }
                    />

                    <TechStackIcon
                      name="Tailwind"
                      hoverColor="#06B6D4"
                      icon={
                        <svg
                          className="w-5 h-5 mb-[3px]"
                          viewBox="0 25 128 78"
                          fill="currentColor"
                        >
                          <path d="M64.004 25.602c-17.067 0-27.73 8.53-32 25.597 6.398-8.531 13.867-11.73 22.398-9.597 4.871 1.214 8.352 4.746 12.207 8.66C72.883 56.629 80.145 64 96.004 64c17.066 0 27.73-8.531 32-25.602-6.399 8.536-13.867 11.735-22.399 9.602-4.87-1.215-8.347-4.746-12.207-8.66-6.27-6.367-13.53-13.738-29.394-13.738zM32.004 64c-17.066 0-27.73 8.531-32 25.602C6.402 81.066 13.87 77.867 22.402 80c4.871 1.215 8.352 4.746 12.207 8.66 6.274 6.367 13.536 13.738 29.395 13.738 17.066 0 27.73-8.53 32-25.597-6.399 8.531-13.867 11.73-22.399 9.597-4.87-1.214-8.347-4.746-12.207-8.66C55.128 71.371 47.868 64 32.004 64zm0 0" />
                        </svg>
                      }
                    />
                  </div>
                </ScrollFade>
              </div>
            </div>
          </motion.main>

          {/* 스크롤 유도 애니메이션 */}
          <motion.div
            className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20"
            style={{ opacity: smoothHeroOpacity }}
          >
            <motion.div
              className="flex flex-col items-center gap-1 md:gap-2 text-gray-500"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-[10px] md:text-xs uppercase tracking-widest">
                Scroll
              </span>
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </motion.div>
          </motion.div>
        </section>

        {/* Section 2: Features Section */}
        <section
          ref={featuresRef}
          className="relative py-32 px-6"
          style={{ minHeight: "100dvh" }}
        >
          {/* 배경 글로우 효과 - SVG로 밴딩 방지 + CSS mask로 상단 페이드 (성능 최적화) */}
          <svg
            className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
            }}
          >
            <defs>
              {/* 우측 보라 글로우 - 위치를 더 아래로 조정 */}
              <radialGradient
                id="features-glow-right"
                cx="110%"
                cy="40%"
                r="50%"
                fx="110%"
                fy="40%"
              >
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.08" />
                <stop offset="60%" stopColor="#818cf8" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
              </radialGradient>
              {/* 좌측 하단 청록 글로우 */}
              <radialGradient
                id="features-glow-left"
                cx="-10%"
                cy="90%"
                r="40%"
                fx="-10%"
                fy="90%"
              >
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.08" />
                <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#features-glow-right)" />
            <rect width="100%" height="100%" fill="url(#features-glow-left)" />
          </svg>

          <motion.div
            className="max-w-7xl mx-auto relative z-10 will-change-[transform,opacity]"
            style={{
              opacity: smoothFeaturesOpacity,
              scale: smoothFeaturesScale,
            }}
          >
            {/* Section Header */}
            <FeatureSectionReveal>
              <div className="text-center mb-20">
                <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6">
                  {t.features.sectionLabel}
                </span>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  {t.features.title}{" "}
                  <span
                    className="gradient-text"
                    data-text={t.features.titleHighlight}
                  >
                    {t.features.titleHighlight}
                  </span>
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  {t.features.description}
                  <br />
                  {t.features.descriptionSub}
                </p>
              </div>
            </FeatureSectionReveal>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature Cards with staggered scroll animation */}
              <FeatureCard
                delay={0}
                iconBg="bg-cyan-500/10"
                iconColor="text-cyan-400"
                iconHoverBg="group-hover:bg-cyan-500/20"
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                }
                title={t.features.items.realtime.title}
                description={t.features.items.realtime.description}
              />

              <FeatureCard
                delay={0.1}
                iconBg="bg-violet-500/10"
                iconColor="text-violet-400"
                iconHoverBg="group-hover:bg-violet-500/20"
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                }
                title={t.features.items.grid.title}
                description={t.features.items.grid.description}
              />

              <FeatureCard
                delay={0.2}
                iconBg="bg-pink-500/10"
                iconColor="text-pink-400"
                iconHoverBg="group-hover:bg-pink-500/20"
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                }
                title={t.features.items.css.title}
                description={t.features.items.css.description}
              />

              <FeatureCard
                delay={0.3}
                iconBg="bg-amber-500/10"
                iconColor="text-amber-400"
                iconHoverBg="group-hover:bg-amber-500/20"
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                }
                title={t.features.items.preset.title}
                description={t.features.items.preset.description}
              />

              <FeatureCard
                delay={0.1}
                iconBg="bg-emerald-500/10"
                iconColor="text-emerald-400"
                iconHoverBg="group-hover:bg-emerald-500/20"
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                }
                title={t.features.items.overlay.title}
                description={t.features.items.overlay.description}
              />

              <FeatureCard
                delay={0.2}
                iconBg="bg-blue-500/10"
                iconColor="text-blue-400"
                iconHoverBg="group-hover:bg-blue-500/20"
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                }
                title={t.features.items.noteEffect.title}
                description={t.features.items.noteEffect.description}
              />

              <FeatureCard
                delay={0.3}
                iconBg="bg-indigo-500/10"
                iconColor="text-indigo-400"
                iconHoverBg="group-hover:bg-indigo-500/20"
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                }
                title={t.features.items.keyCounter.title}
                description={t.features.items.keyCounter.description}
              />

              <FeatureCard
                delay={0.4}
                iconBg="bg-orange-500/10"
                iconColor="text-orange-400"
                iconHoverBg="group-hover:bg-orange-500/20"
                icon={
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
                title={t.features.items.settings.title}
                description={t.features.items.settings.description}
              />
            </div>
          </motion.div>
        </section>

        {/* Section 3: Showcase Section */}
        <section className="relative py-32 px-6 overflow-hidden">
          {/* 배경 글로우 효과 */}
          <svg
            className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Section 2에서 이어지는 좌측 상단 청록 글로우 */}
              <radialGradient
                id="showcase-glow-top-left"
                cx="-10%"
                cy="-10%"
                r="40%"
                fx="-10%"
                fy="-10%"
              >
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.08" />
                <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </radialGradient>

              <radialGradient
                id="showcase-glow-center"
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.08" />
                <stop offset="60%" stopColor="#c084fc" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#showcase-glow-top-left)"
            />
            <rect
              width="100%"
              height="100%"
              fill="url(#showcase-glow-center)"
            />
          </svg>

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Section Header */}
            <FeatureSectionReveal>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  {t.showcase.title}{" "}
                  <span
                    className="gradient-text"
                    data-text={t.showcase.titleHighlight}
                  >
                    {t.showcase.titleHighlight}
                  </span>
                  {t.showcase.titleSuffix}
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  {t.showcase.description}
                </p>
              </div>
            </FeatureSectionReveal>

            {/* Video Showcase Grid - Bento Style */}
            <ShowcaseGrid t={t} />
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-6 px-6 border-t border-white/5 bg-[#0a0a0c]">
          <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-4">
            <div className="text-gray-500 text-sm text-center">
              {t.footer.copyright}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Showcase Grid 컴포넌트 - 오른쪽 카드들이 동시에 나타나도록 스크롤 공유
function ShowcaseGrid({ t }: { t: any }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 클라이언트에서만 모바일 체크 (hydration 오류 방지)
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // 그리드 전체의 스크롤 진행률
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start end", "center center"],
  });

  return (
    <div ref={gridRef} className="showcase-grid">
      <ShowcaseVideoCard
        src="/assets/CSS.mp4"
        title={t.showcase.items.css.title}
        description={t.showcase.items.css.description}
        className="showcase-card-large"
        delay={0}
        direction="left"
      />
      <ShowcaseVideoCard
        src="/assets/Grid.mp4"
        title={t.showcase.items.grid.title}
        description={t.showcase.items.grid.description}
        className="showcase-card-medium"
        delay={0}
        direction="right"
        parentScrollProgress={isMobile ? undefined : scrollYProgress}
      />
      <ShowcaseVideoCard
        src="/assets/counter.webm"
        title={t.showcase.items.counter.title}
        description={t.showcase.items.counter.description}
        className="showcase-card-small"
        delay={0}
        direction={isMobile ? "left" : "right"}
        parentScrollProgress={isMobile ? undefined : scrollYProgress}
        videoScale={1.02}
      />
      <ShowcaseVideoCard
        src="/assets/plugin.webm"
        title={t.showcase.items.plugin.title}
        description={t.showcase.items.plugin.description}
        className="showcase-card-small"
        delay={0}
        direction="right"
        parentScrollProgress={isMobile ? undefined : scrollYProgress}
      />
    </div>
  );
}

// Tech Stack 아이콘 컴포넌트
function TechStackIcon({
  name,
  hoverColor,
  icon,
}: {
  name: string;
  hoverColor: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      className="flex items-center gap-2 text-gray-500 transition-colors duration-300 cursor-default"
      title={name}
      whileHover={{ scale: 1.1, color: hoverColor }}
      transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
    >
      {icon}
      <span className="text-xs font-medium">{name}</span>
    </motion.div>
  );
}

// Feature Card 컴포넌트
function FeatureCard({
  delay,
  iconBg,
  iconColor,
  iconHoverBg,
  icon,
  title,
  description,
}: {
  delay: number;
  iconBg: string;
  iconColor: string;
  iconHoverBg: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [60, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);

  return (
    <motion.div
      ref={ref}
      className="will-change-[transform,opacity] transition-[transform,opacity] duration-100 ease-out"
      style={{
        opacity,
        y,
        scale,
      }}
    >
      <div className="feature-card group h-full">
        <div className={`feature-icon ${iconBg} ${iconColor} ${iconHoverBg}`}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3 text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
      </div>
    </motion.div>
  );
}

// Showcase Video Card 컴포넌트
function ShowcaseVideoCard({
  src,
  title,
  description,
  className = "",
  delay = 0,
  direction = "left",
  parentScrollProgress,
  videoScale = 1,
}: {
  src: string;
  title: string;
  description: string;
  className?: string;
  delay?: number;
  direction?: "left" | "right";
  parentScrollProgress?: any;
  videoScale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(() => {
    const clean = src.split("?")[0]?.split("#")[0] ?? src;
    return clean.toLowerCase().endsWith(".webm") ? null : src;
  });

  // 클라이언트에서만 모바일 체크 (hydration 오류 방지)
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    const clean = src.split("?")[0]?.split("#")[0] ?? src;

    if (!clean.toLowerCase().endsWith(".webm")) {
      setResolvedSrc(src);
      return;
    }

    const testVideo = document.createElement("video");
    const canPlay =
      testVideo.canPlayType('video/webm; codecs="vp8, vorbis"') ||
      testVideo.canPlayType('video/webm; codecs="vp9, opus"') ||
      testVideo.canPlayType("video/webm");

    setResolvedSrc(canPlay ? src : null);
  }, [src]);

  useEffect(() => {
    const el = ref.current;
    if (!resolvedSrc) return;
    if (!el) return;

    if (shouldLoadVideo) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoadVideo(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: "400px 0px" } // 1200px → 400px로 줄여서 더 늦게 로드
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [resolvedSrc, shouldLoadVideo]);

  useEffect(() => {
    const el = ref.current;
    const video = videoRef.current;
    if (!el || !video) return;
    if (!resolvedSrc) return;
    if (!shouldLoadVideo) return;

    const pause = () => {
      try {
        video.pause();
      } catch {}
    };

    const play = async () => {
      try {
        await video.play();
      } catch {}
    };

    if (!("IntersectionObserver" in window)) {
      void play();
      return pause;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          void play();
        } else {
          pause();
        }
      },
      { threshold: 0.2, rootMargin: "200px 0px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      pause();
    };
  }, [resolvedSrc, shouldLoadVideo]);

  const { scrollYProgress: selfScrollProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  // 부모 스크롤 진행률이 있으면 사용, 없으면 자체 스크롤 사용
  const scrollYProgress = parentScrollProgress ?? selfScrollProgress;

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  // 모바일에서는 좌우 애니메이션 제거 (2페이지 카드처럼 아래에서 위로만)
  const xOffset = isMobile ? 0 : direction === "left" ? -60 : 60;
  const x = useTransform(scrollYProgress, [0, 0.5], [xOffset, 0]);
  // 모바일에서는 y 애니메이션 추가 (2페이지 FeatureCard처럼), PC에서는 대각선 효과
  const yOffset = isMobile ? 60 : 40;
  const y = useTransform(scrollYProgress, [0, 0.5], [yOffset, 0]);
  // 모바일에서 스케일 애니메이션 추가 (2페이지 카드처럼)
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5],
    [isMobile ? 0.9 : 1, 1]
  );

  return (
    <motion.div
      ref={ref}
      className={`showcase-card ${className} transition-[transform,opacity] duration-100 ease-out`}
      style={{
        opacity,
        x,
        y,
        scale,
      }}
    >
      <div className="group relative h-full overflow-hidden rounded-2xl bg-white/5 border border-white/5 transition-colors duration-300 hover:border-white/10">
        {/* Video Container */}
        <div className="absolute inset-0">
          {resolvedSrc && shouldLoadVideo ? (
            <video
              ref={videoRef}
              src={resolvedSrc}
              preload="metadata"
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              style={
                videoScale !== 1
                  ? { transform: `scale(${videoScale})` }
                  : undefined
              }
              onError={() => setResolvedSrc(null)}
            />
          ) : (
            <div className="w-full h-full bg-[#0b0b0d]" />
          )}
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/40 to-transparent opacity-95" />
        </div>

        {/* Content - 모바일 패딩 및 텍스트 크기 조정 */}
        <div className="relative h-full flex flex-col justify-end p-4 sm:p-6 z-10">
          <h3
            key={title}
            className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2"
          >
            {title}
          </h3>
          <p
            key={description}
            className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed line-clamp-2 sm:line-clamp-none"
          >
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// 메인 export 컴포넌트 - 클라이언트 마운트 후에만 Inner 렌더링
export function LandingContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR/SSG에서는 로딩 플레이스홀더만 보여줌
  if (!mounted) {
    return <LoadingPlaceholder />;
  }

  // 클라이언트에서 마운트된 후 실제 콘텐츠 렌더링
  return <LandingContentInner />;
}
