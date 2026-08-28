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

// 제품 랜딩 — 히어로(앱 스크린샷) → 기능 스토리 → 설정 미리보기 → 나머지 기능 → CTA
export function LandingContent() {
  const { t, locale } = useLanguage();

  // 좌우 교차 스토리 (각 행 = 메시지 하나 + 클립 하나)
  const stories = [
    {
      clip: "custom-css",
      title: t.showcase.items.css.title,
      desc: t.showcase.items.css.description,
    },
    {
      clip: "custom-js",
      title: t.showcase.items.plugin.title,
      desc: t.showcase.items.plugin.description,
    },
    {
      clip: "note-effect",
      title: t.showcase.items.noteEffect.title,
      desc: t.showcase.items.noteEffect.description,
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
              <span
                className="dim-text whitespace-nowrap"
                data-text={t.hero.titleHighlight}
              >
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
              <div
                className="hero-frame"
                onContextMenu={(e) => e.preventDefault()}
              >
                <img
                  src={`/assets/app-${locale}.png`}
                  alt={t.hero.screenshotAlt}
                  width={1804}
                  height={976}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  draggable={false}
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
            <FeatureRow key={s.clip} {...s} reverse={i % 2 === 1} />
          ))}
        </div>
      </section>

      {/* ── 설정 미리보기 — 앱 설정 화면에 도는 클립 그대로 ── */}
      <section className="relative py-24 md:py-32">
        <div className="site-rail">
          <Reveal className="mb-14 md:mb-16 max-w-2xl">
            <h2
              className="text-headline font-semibold text-grey-900"
              style={{ textIndent: opticalLead(t.features.title) }}
            >
              {t.features.title}{" "}
              <span className="dim-text" data-text={t.features.titleHighlight}>
                {t.features.titleHighlight}
              </span>
            </h2>
            <p className="mt-4 text-lead font-normal text-grey-400 break-keep">
              {t.features.description} {t.features.descriptionSub}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {PREVIEW_KEYS.map((key, i) => (
              <Reveal key={key} delay={(i % 3) * 70}>
                <PreviewCard
                  clip={PREVIEW_CLIPS[key]}
                  title={t.previews.items[key].title}
                  desc={t.previews.items[key].description}
                />
              </Reveal>
            ))}
          </div>

          {/* 클립이 없는 나머지 기능은 글로만 */}
          <Reveal delay={80}>
            <div className="mt-16 md:mt-20 border-t border-white/[0.06] pt-14 md:pt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
              {REST_FEATURE_KEYS.map((key) => (
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
      <section className="relative pt-28 pb-52 md:pt-36 md:pb-60">
        <Reveal className="site-rail">
          <h2
            className="max-w-2xl text-headline font-semibold break-keep text-grey-900"
            style={{ textIndent: opticalLead(t.cta.title) }}
          >
            {t.cta.title}{" "}
            <span className="dim-text" data-text={t.cta.titleHighlight}>
              {t.cta.titleHighlight}
            </span>
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

// 좌우 교차 기능 섹션 — 클립은 바깥쪽 가장자리에 붙인다
function FeatureRow({
  clip,
  title,
  desc,
  reverse,
}: {
  clip: string;
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
      <Reveal
        delay={80}
        className={`w-full max-w-[640px] ${
          reverse ? "lg:order-1 lg:justify-self-start" : "lg:justify-self-end"
        }`}
      >
        <ClipFrame clip={clip} rounding="lg" />
      </Reveal>
    </div>
  );
}

// 설정 미리보기 카드 — 클립 + 설정 이름 + 설명
function PreviewCard({
  clip,
  title,
  desc,
}: {
  clip: string;
  title: string;
  desc: string;
}) {
  return (
    <div>
      <ClipFrame clip={clip} />
      <h3 className="mt-5 text-[15px] font-medium leading-6 text-grey-700">
        {title}
      </h3>
      <p className="mt-1.5 text-[15px] font-normal leading-6 text-[#969DA8] break-keep">
        {desc}
      </p>
    </div>
  );
}

// 클립 프레임 — 화면 근처에서 로드하고 화면을 벗어나면 멈춘다.
// 한 페이지에 아홉 개가 있어 전부 돌면 디코딩이 낭비된다
function ClipFrame({
  clip,
  rounding = "md",
}: {
  clip: string;
  rounding?: "md" | "lg";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.2, rootMargin: "200px 0px" }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      videoRef.current?.pause();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`clip-frame ${rounding === "lg" ? "lg" : ""} aspect-[16/10]`}
    >
      {shouldLoad && (
        <video
          ref={videoRef}
          src={`/assets/clips/${clip}.mp4`}
          preload="metadata"
          loop
          muted
          autoPlay
          playsInline
          className="w-full h-full block"
        />
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
type PreviewKey =
  | "keyCounter"
  | "obsMode"
  | "overlayLock"
  | "alwaysOnTop"
  | "resizeAnchor"
  | "trayEnabled";

// 설정 화면에서 도는 클립과 같은 파일
const PREVIEW_CLIPS: Record<PreviewKey, string> = {
  keyCounter: "key-counter",
  obsMode: "obs-mode",
  overlayLock: "overlay-lock",
  alwaysOnTop: "always-on-top",
  resizeAnchor: "resize-anchor",
  trayEnabled: "tray-enabled",
};

const PREVIEW_KEYS: PreviewKey[] = [
  "keyCounter",
  "obsMode",
  "overlayLock",
  "alwaysOnTop",
  "resizeAnchor",
  "trayEnabled",
];

// 스토리와 미리보기에서 다루지 않은 기능
type FeatureKey = "realtime" | "grid" | "preset" | "settings";

const REST_FEATURE_KEYS: FeatureKey[] = [
  "realtime",
  "grid",
  "preset",
  "settings",
];

const TECH_STACK: { name: string; src: string }[] = [
  { name: "React", src: "/assets/tech/React.svg" },
  { name: "TypeScript", src: "/assets/tech/TypeScript.svg" },
  { name: "Tauri", src: "/assets/tech/Tauri.svg" },
  { name: "Tailwind", src: "/assets/tech/Tailwind CSS.svg" },
];
