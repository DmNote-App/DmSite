"use client";

import Link from "next/link";
import { useLanguage } from "./i18n";
import { useRef, useState, useEffect } from "react";
import { Reveal } from "./Reveal";

const GITHUB_URL = "https://github.com/DmNote-App/DmNote";
const RELEASES_URL = `${GITHUB_URL}/releases`;
const LATEST_RELEASE_URL = `${RELEASES_URL}/latest`;

// 큰 제목 광학 정렬 — 라틴 대문자는 글리프에 좌측 사이드베어링이 있어 왼쪽이 살짝 떠 보인다.
// 한글 등은 베어링이 ~0이라 보정하면 오히려 왼쪽으로 튀므로 첫 글자가 라틴일 때만 당겨준다
const opticalLead = (text: string) =>
  /^[A-Za-z]/.test(text) ? "-0.03em" : undefined;

// 제품 랜딩 — 히어로(실제 앱 스크린샷) → 기능 스토리 → 개요 → CTA
export function LandingContent() {
  const { t, locale } = useLanguage();

  // 좌우 교차 스토리 섹션 (각 섹션 = 메시지 하나 + 제품 영상 하나)
  const stories = [
    {
      src: "/assets/CSS.mp4",
      title: t.showcase.items.css.title,
      desc: t.features.items.css.description,
    },
    {
      src: "/assets/counter.webm",
      title: t.features.items.realtime.title,
      desc: t.features.items.realtime.description,
    },
    {
      src: "/assets/plugin.webm",
      title: t.showcase.items.plugin.title,
      desc: t.showcase.items.plugin.description,
    },
  ];

  return (
    <div className="landing-bg relative z-10 text-grey-900 font-sans overflow-x-hidden w-full selection:bg-accent-500 selection:text-white">
      {/* ── Hero — 왼쪽 텍스트 블록, 바로 아래 풀폭 미디어 ── */}
      <section className="relative pt-40 pb-4 md:pt-60 md:pb-6">
        <div className="site-rail">
          <Reveal>
            <h1
              className="max-w-2xl text-display font-semibold text-grey-900"
              style={{ textIndent: opticalLead(t.hero.title) }}
            >
              {t.hero.title}{" "}
              <span className="dim-text whitespace-nowrap">
                {t.hero.titleHighlight}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-6 max-w-xl text-lead font-normal text-grey-400 break-keep">
              {t.hero.description} {t.hero.descriptionSub}
            </p>
          </Reveal>

          <Reveal delay={140}>
            <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-6">
                <a
                  href={LATEST_RELEASE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="dm-cta-link py-1"
                >
                  {t.hero.download}
                  <ArrowIcon />
                </a>
                <a
                  href={RELEASES_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="dm-cta-link secondary py-1"
                >
                  {t.hero.release}
                  <ArrowIcon />
                </a>
              </div>
              <div className="flex items-center flex-wrap gap-x-5 sm:gap-x-6 gap-y-3">
                {TECH_STACK.map((tech) => (
                  <TechStackIcon key={tech.name} name={tech.name} src={tech.src} />
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="relative mt-12 md:mt-14">
              <div className="hero-frame">
                <img
                  src={`/assets/app-${locale}.png`}
                  alt={t.hero.screenshotAlt}
                  width={1804}
                  height={976}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-auto block"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 기능 스토리 (좌우 교차) ── */}
      <section className="relative pt-10 pb-24 md:pt-12 md:pb-32">
        <div className="site-rail space-y-24 md:space-y-32">
          {stories.map((s, i) => (
            <FeatureRow key={s.src} {...s} reverse={i % 2 === 1} />
          ))}
        </div>
      </section>

      {/* ── 전체 기능 개요 ── */}
      <section className="relative py-24 md:py-32">
        <div className="site-rail">
          <Reveal className="mb-14 md:mb-16 max-w-2xl">
            <h2
              className="text-headline font-semibold text-grey-900"
              style={{ textIndent: opticalLead(t.features.title) }}
            >
              {t.features.title}{" "}
              <span className="dim-text">{t.features.titleHighlight}</span>
            </h2>
            <p className="mt-4 text-lead font-normal text-grey-400 break-keep">
              {t.features.description} {t.features.descriptionSub}
            </p>
          </Reveal>

          <Reveal delay={80}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
              {FEATURE_KEYS.map((key) => (
                <div key={key}>
                  <h3 className="text-[15px] font-medium leading-6 text-grey-700">
                    {t.features.items[key].title}
                  </h3>
                  <p className="mt-1.5 text-[15px] font-normal leading-6 text-[#969DA8] break-keep">
                    {t.features.items[key].description}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 마무리 CTA ── */}
      <section className="relative py-28 md:py-36 border-t border-white/[0.06]">
        <Reveal className="site-rail">
          <h2
            className="max-w-2xl text-headline font-semibold break-keep text-grey-900"
            style={{ textIndent: opticalLead(t.cta.title) }}
          >
            {t.cta.title}{" "}
            <span className="dim-text">{t.cta.titleHighlight}</span>
          </h2>
          <p className="mt-4 max-w-xl text-lead font-normal text-grey-400 break-keep">
            {t.cta.description}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={LATEST_RELEASE_URL}
              target="_blank"
              rel="noreferrer"
              className="dm-btn h-11 px-6 text-[15px] w-full sm:w-auto"
            >
              <DownloadIcon />
              {t.cta.button}
            </a>
            <Link
              href="/docs"
              className="dm-btn-ghost h-11 px-6 text-[15px] w-full sm:w-auto"
            >
              {t.cta.secondary}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8">
        <div className="site-rail flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <div className="text-[13px] text-grey-400">{t.footer.copyright}</div>
          <nav className="flex gap-6 text-sm">
            <Link
              href="/docs"
              className="text-grey-500 hover:text-grey-900 transition-colors"
            >
              {t.footer.links.docs}
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-grey-500 hover:text-grey-900 transition-colors"
            >
              {t.footer.links.github}
            </a>
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noreferrer"
              className="text-grey-500 hover:text-grey-900 transition-colors"
            >
              {t.footer.links.releases}
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

// 좌우 교차 기능 섹션
function FeatureRow({
  src,
  title,
  desc,
  reverse,
}: {
  src: string;
  title: string;
  desc: string;
  reverse: boolean;
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
      <Reveal className={reverse ? "lg:order-2" : ""}>
        <div className="max-w-md text-left">
          <h3 className="text-title font-semibold break-keep">{title}</h3>
          <p className="mt-4 text-[15px] font-normal leading-6 text-grey-400 break-keep">
            {desc}
          </p>
        </div>
      </Reveal>
      <Reveal delay={80} className={reverse ? "lg:order-1" : ""}>
        <ProductWindow src={src} />
      </Reveal>
    </div>
  );
}

// 제품 창 목업 — 화면 안에서만 재생, webm 폴백 유지
function ProductWindow({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(() => {
    const clean = src.split("?")[0]?.split("#")[0] ?? src;
    return clean.toLowerCase().endsWith(".webm") ? null : src;
  });

  // webm 재생 가능 여부 (Safari 폴백)
  useEffect(() => {
    const clean = src.split("?")[0]?.split("#")[0] ?? src;
    if (!clean.toLowerCase().endsWith(".webm")) {
      setResolvedSrc(src);
      return;
    }
    const test = document.createElement("video");
    const canPlay =
      test.canPlayType('video/webm; codecs="vp8, vorbis"') ||
      test.canPlayType('video/webm; codecs="vp9, opus"') ||
      test.canPlayType("video/webm");
    setResolvedSrc(canPlay ? src : null);
  }, [src]);

  // 뷰포트 근처 진입 시 로드 + 화면 안에서만 재생
  useEffect(() => {
    const el = ref.current;
    if (!el || !resolvedSrc) return;

    const play = () => videoRef.current?.play().catch(() => {});
    const pause = () => {
      try {
        videoRef.current?.pause();
      } catch {}
    };

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          play();
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
  }, [resolvedSrc]);

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-2xl aspect-[16/10]"
      style={{
        backgroundColor: "rgb(var(--surface-muted))",
        boxShadow: "0 40px 120px -40px rgba(0,0,0,0.85)",
      }}
    >
      {resolvedSrc && shouldLoad ? (
        <video
          ref={videoRef}
          src={resolvedSrc}
          preload="metadata"
          loop
          muted
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          onError={() => setResolvedSrc(null)}
        />
      ) : (
        <div className="w-full h-full" />
      )}
    </div>
  );
}

// Tech Stack 아이콘 — 정적, CSS 호버
function TechStackIcon({ name, src }: { name: string; src: string }) {
  return (
    <div
      className="group flex items-center gap-1.5 sm:gap-2 text-grey-400 hover:text-grey-900 transition-colors cursor-default"
      title={name}
    >
      <img
        src={src}
        alt=""
        className="w-5 h-5 opacity-60 saturate-50 brightness-90 transition duration-200 group-hover:opacity-100 group-hover:saturate-100 group-hover:brightness-100"
        loading="lazy"
      />
      <span className="text-[13px] font-medium">{name}</span>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
      />
    </svg>
  );
}

// ── 데이터 ──
type FeatureKey =
  | "realtime"
  | "grid"
  | "css"
  | "preset"
  | "overlay"
  | "noteEffect"
  | "keyCounter"
  | "settings";

const FEATURE_KEYS: FeatureKey[] = [
  "realtime",
  "grid",
  "css",
  "preset",
  "overlay",
  "noteEffect",
  "keyCounter",
  "settings",
];

const TECH_STACK: { name: string; src: string }[] = [
  { name: "React", src: "/assets/tech/React.svg" },
  { name: "TypeScript", src: "/assets/tech/TypeScript.svg" },
  { name: "Tauri", src: "/assets/tech/Tauri.svg" },
  { name: "Tailwind", src: "/assets/tech/Tailwind CSS.svg" },
];
