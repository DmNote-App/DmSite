"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { useNicknameStore } from "@/stores/useNicknameStore";
import {
  ArrowLeft,
  RefreshCcw,
  Disc,
  Sprout,
  Gamepad2,
  Download,
} from "lucide-react";
import Tooltip from "@/components/Tooltip";
import { useImageSaver } from "@/hooks/useImageSaver";
import {
  BUTTONS,
  VArchiveError,
  fetchRecapData,
  type RecapResult,
  type TierResponse,
} from "@/lib/varchive";

function TierVideoList({
  tiers,
}: {
  tiers: Record<number, TierResponse | null | undefined>;
}) {
  const videoRefs = useMemo(() => {
    return { current: {} as Record<number, HTMLVideoElement> };
  }, []);

  // Track readiness
  const [readyCount, setReadyCount] = useState(0);
  const readySet = useRef(new Set<number>());
  const hasStarted = useRef(false);
  const syncIntervalId = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const isInViewRef = useRef(false);

  const tierConfigs = useMemo(() => {
    return BUTTONS.map((button) => {
      const tierData = tiers[button];
      const tierName =
        typeof tierData?.tier?.name === "string" ? tierData.tier.name : null;
      let videoPath: string | null = null;
      let isBeginner = false;
      let isAmateur = false;

      if (tierName) {
        const lower = tierName.replace(/\s+/g, "").toLowerCase();
        const tiersList = [
          "iron",
          "bronze",
          "silver",
          "gold",
          "platinum",
          "diamond",
          "master",
          "grandmaster",
        ];
        const match = tiersList.find((t) => lower.startsWith(t));
        if (match) {
          // recap 자산은 public/assets 아래에서 제공
          videoPath = `/assets/tier/${match}.mp4`;
        } else {
          if (lower.includes("beginner")) isBeginner = true;
          if (lower.includes("amateur")) isAmateur = true;
        }
      }

      return { button, tierData, tierName, videoPath, isBeginner, isAmateur };
    });
  }, [tiers]);

  const videoCount = tierConfigs.filter((c) => c.videoPath).length;

  useEffect(() => {
    isInViewRef.current = isInView;
  }, [isInView]);

  useEffect(() => {
    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const stopSync = useCallback(() => {
    if (syncIntervalId.current !== null) {
      window.clearInterval(syncIntervalId.current);
      syncIntervalId.current = null;
    }
  }, []);

  const syncVideos = useCallback(() => {
    if (!isInViewRef.current) {
      return;
    }

    const videos = Object.values(videoRefs.current).filter(Boolean);
    if (videos.length < 2) {
      return;
    }

    // Use the first video as master
    const master = videos[0];
    if (master.readyState < 2) {
      return;
    }
    const masterTime = master.currentTime;

    // Sync all other videos to master
    for (let i = 1; i < videos.length; i++) {
      const video = videos[i];
      const diff = Math.abs(video.currentTime - masterTime);

      // If drift exceeds 120ms, force sync
      if (diff > 0.12) {
        video.currentTime = masterTime;
      }
    }
  }, [videoRefs]);

  const startSync = useCallback(() => {
    if (syncIntervalId.current !== null) return;
    syncVideos();
    syncIntervalId.current = window.setInterval(syncVideos, 250);
  }, [syncVideos]);

  const isContainerInView = useCallback(() => {
    const target = containerRef.current;
    if (!target) return false;
    const rect = target.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const threshold = rect.height * 0.2;
    const topVisible = rect.top + threshold < viewportHeight;
    const bottomVisible = rect.bottom - threshold > 0;
    return topVisible && bottomVisible;
  }, []);

  const seekTo = useCallback((video: HTMLVideoElement, targetTime: number) => {
    return new Promise<void>((resolve) => {
      const isAtTarget = Math.abs(video.currentTime - targetTime) < 0.001;
      if (isAtTarget) {
        resolve();
        return;
      }

      const handleSeeked = () => resolve();
      video.addEventListener("seeked", handleSeeked, { once: true });
      video.currentTime = targetTime;
    });
  }, []);

  const resumePlayback = useCallback(() => {
    if (!hasStarted.current) return;
    const shouldPlay = isInViewRef.current || isContainerInView();
    if (!shouldPlay) return;
    if (!isInViewRef.current) {
      isInViewRef.current = true;
      setIsInView(true);
    }

    const videos = Object.values(videoRefs.current).filter(Boolean);
    if (videos.length === 0) return;

    const playPromises = videos.map((video) => video.play().catch(() => { }));
    Promise.all(playPromises).then(() => {
      const masterTime = videos[0]?.currentTime ?? 0;
      videos.forEach((video) => {
        if (Math.abs(video.currentTime - masterTime) > 0.02) {
          video.currentTime = masterTime;
        }
      });
      startSync();
    });
  }, [isContainerInView, startSync, videoRefs]);

  // Synchronized playback start
  useEffect(() => {
    if (!isInView) return;

    if (readyCount >= videoCount && videoCount > 0 && !hasStarted.current) {
      hasStarted.current = true;

      const videos = Object.values(videoRefs.current).filter(Boolean);

      const startPlayback = async () => {
        // Pause all videos before syncing to a common start point
        videos.forEach((video) => {
          video.pause();
        });

        // Seek all videos to the start and wait for the seek to settle
        await Promise.all(videos.map((video) => seekTo(video, 0)));

        // Start all videos in the same render frame
        await new Promise(requestAnimationFrame);

        const playPromises = videos.map((video) =>
          video.play().catch(() => { })
        );
        await Promise.all(playPromises);

        // After all play() promises resolve, force sync one more time
        const masterTime = videos[0]?.currentTime ?? 0;
        videos.forEach((video) => {
          if (Math.abs(video.currentTime - masterTime) > 0.02) {
            video.currentTime = masterTime;
          }
        });

        console.log(`[TierVideoList] Started ${videos.length} videos`);

        // Start periodic sync loop
        startSync();
      };

      void startPlayback();
    }
  }, [isInView, readyCount, seekTo, startSync, videoCount, videoRefs]);

  useEffect(() => {
    const videos = Object.values(videoRefs.current).filter(Boolean);
    if (videos.length === 0) return;

    if (!isInView) {
      stopSync();

      const masterTime = videos[0]?.currentTime ?? 0;
      videos.forEach((video) => {
        if (Math.abs(video.currentTime - masterTime) > 0.02) {
          video.currentTime = masterTime;
        }
        video.pause();
      });

      return;
    }

    if (!hasStarted.current) return;
    if (syncIntervalId.current !== null) return;

    const masterTime = videos[0]?.currentTime ?? 0;
    videos.forEach((video) => {
      if (Math.abs(video.currentTime - masterTime) > 0.02) {
        video.currentTime = masterTime;
      }
    });

    const playPromises = videos.map((video) => video.play().catch(() => { }));
    Promise.all(playPromises).then(() => {
      const syncedTime = videos[0]?.currentTime ?? 0;
      videos.forEach((video) => {
        if (Math.abs(video.currentTime - syncedTime) > 0.02) {
          video.currentTime = syncedTime;
        }
      });
    });

    startSync();
  }, [isInView, startSync, stopSync, videoRefs]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopSync();
        return;
      }
      resumePlayback();
    };

    const handlePageShow = () => {
      if (document.visibilityState === "visible") {
        resumePlayback();
      }
    };

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        resumePlayback();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleFocus);
    };
  }, [resumePlayback, stopSync]);

  // Cleanup sync on unmount
  useEffect(() => {
    return () => {
      stopSync();
    };
  }, [stopSync]);

  // Use canplay to ensure the first frame is decodable without waiting for full buffer
  const handleCanPlay = (button: number) => {
    if (!readySet.current.has(button)) {
      readySet.current.add(button);
      setReadyCount((prev) => prev + 1);
    }
  };

  return (
    <div
      ref={containerRef}
      className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {tierConfigs.map(
        ({ button, tierData, tierName, videoPath, isBeginner, isAmateur }) => (
          <div
            key={button}
            className="flex items-center gap-4 rounded-xl bg-grey-50 p-4 transition-colors hover:bg-grey-100"
          >
            <div
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black"
              style={{
                WebkitMaskImage: "-webkit-radial-gradient(white, black)",
              }}
            >
              {videoPath ? (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[button] = el;
                    else delete videoRefs.current[button];
                  }}
                  src={videoPath}
                  loop
                  muted
                  playsInline
                  autoPlay
                  preload="auto"
                  crossOrigin="anonymous"
                  onCanPlay={() => handleCanPlay(button)}
                  onContextMenu={(e) => e.preventDefault()}
                  className="h-full w-full object-cover"
                />
              ) : isBeginner ? (
                <div className="flex h-full w-full flex-col items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                  <Sprout size={32} />
                </div>
              ) : isAmateur ? (
                <div className="flex h-full w-full flex-col items-center justify-center bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-200">
                  <Gamepad2 size={32} />
                </div>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-grey-200 text-grey-400">
                  <Disc size={24} className="opacity-50" />
                  <span className="text-[10px] font-bold">NO DATA</span>
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-xs font-bold text-grey-500 mb-0.5">
                {button}B TIER
              </p>
              {tierData && tierName ? (
                <>
                  <h4 className="truncate text-xl font-bold text-grey-900">
                    {tierName}
                  </h4>
                  <p className="text-base font-bold text-brand">
                    {formatCount(Math.round(tierData.tierPoint))} P
                  </p>
                </>
              ) : (
                <p className="text-sm font-medium text-grey-400">기록 없음</p>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}

function TopList({
  tiers,
}: {
  tiers: Record<number, TierResponse | null | undefined>;
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {BUTTONS.map((button) => {
        const tierData = tiers[button];
        const topList = tierData?.topList?.slice(0, 5) ?? [];

        return (
          <div
            key={button}
            className="flex flex-col rounded-2xl bg-grey-50 p-5 transition-colors hover:bg-grey-100"
          >
            <div className="flex flex-wrap items-center justify-between gap-y-2 mb-4">
              <h3 className="text-lg font-bold text-grey-900 flex items-center gap-2">
                <span className="text-brand">{button}B</span> TOP 5
              </h3>
              {tierData && (
                <span className="text-xs font-bold text-grey-500 bg-surface px-2 py-1 rounded-full border border-grey-100">
                  Top 50 합계: {Math.round(tierData.top50sum).toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex flex-col min-h-[402px]">
              {topList.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {topList.map((item, index) => (
                    <div
                      key={`${index}-${item.title}`}
                      className="flex items-center gap-3 rounded-xl bg-surface p-3 border border-grey-100"
                    >
                      <span
                        className={`
                      flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold
                      ${index === 0
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-200"
                            : index === 1
                              ? "bg-grey-100 text-grey-700"
                              : index === 2
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200"
                                : "bg-grey-100 text-grey-500"
                          }
                    `}
                      >
                        {index + 1}
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element -- keep <img> so capture includes jackets reliably */}
                      <img
                        src={`https://v-archive.net/static/images/jackets/${item.title}.jpg`}
                        alt={item.name}
                        className="h-12 w-12 shrink-0 rounded-lg object-cover shadow-sm"
                        loading="lazy"
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-bold text-grey-900">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`
                          px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight
                          ${item.pattern.startsWith("SC")
                                ? "bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200"
                                : "bg-grey-100 text-grey-600"
                              }
                        `}
                          >
                            {item.pattern}
                          </span>
                          <span className="text-xs font-medium text-grey-500">
                            {formatScore(Number(item.score))}% /{" "}
                            {formatScore(Number(item.rating))} P
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-grey-200 bg-grey-50/50">
                  <span className="text-sm font-medium text-grey-400">
                    기록 없음
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const RANGE_START_ISO = "2025-01-01T00:00:00+09:00";
const RANGE_END_ISO = "2026-01-01T00:00:00+09:00";

function formatScore(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCount(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 1,
  }).format(value);
}

function PlayStyleLineChart({
  stats,
  captureMode = false,
}: {
  stats: { buttonRatios: Record<number, number> };
  captureMode?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(300);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width) {
          setWidth(entry.contentRect.width);
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const buttons = [4, 5, 6, 8];

  // Dimensions
  const height = 240; // Fixed height in pixels for the chart drawing area
  const paddingX = captureMode ? 12 : 0; // Avoid stroke clipping in capture
  const paddingY = 20;
  const chartHeight = height - paddingY * 2;
  const chartWidth = Math.max(width - paddingX * 2, 0);
  const chartXStart = paddingX;
  const chartXEnd = Math.max(width - paddingX, paddingX);
  const step = buttons.length > 1 ? chartWidth / (buttons.length - 1) : 0;

  // Calculate max value for dynamic scaling
  const maxValue = Math.max(...buttons.map((b) => stats.buttonRatios[b] || 0));
  const yDomainMax = maxValue > 0 ? maxValue : 100;

  // Calculate points
  const points = buttons.map((btn, i) => {
    const value = stats.buttonRatios[btn] || 0;
    // Normalize based on the maximum value in the dataset so the highest point hits 100%
    const normalized = Math.min(Math.max(value, 0), yDomainMax) / yDomainMax;

    // Distribute equally along X
    const x = paddingX + i * step;
    // Y is inverted (0 at bottom)
    const y = height - paddingY - normalized * chartHeight;

    return { x, y, value, btn };
  });

  // Create path string (SVG polyline/path)
  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Create fill area path (closed loop)
  const fillPathData = `
    ${pathData}
    L ${points[points.length - 1].x} ${height - paddingY}
    L ${points[0].x} ${height - paddingY}
    Z
  `;

  return (
    // Set a fixed height styling on the container so the aspect ratio matches the viewBox
    <div
      ref={containerRef}
      className="w-full min-w-0 flex items-end justify-center"
      style={{ height: `${height}px` }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        overflow="visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--brand))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgb(var(--brand))" stopOpacity="0.05" />
          </linearGradient>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal Grid lines - adjusted for cleaner look */}
        {[0, 0.25, 0.5, 0.75, 1].map((level) => {
          const y = height - paddingY - level * chartHeight;
          return (
            <line
              key={`hgrid-${level}`}
              x1={chartXStart}
              y1={y}
              x2={chartXEnd}
              y2={y}
              stroke="rgb(var(--grey-300))"
              strokeWidth="1"
              strokeDasharray={level === 0 ? "" : "4 4"}
            />
          );
        })}

        {/* Area Fill */}
        {captureMode ? (
          <path d={fillPathData} fill="url(#lineGradient)" />
        ) : (
          <motion.path
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            d={fillPathData}
            fill="url(#lineGradient)"
          />
        )}

        {/* Line Path */}
        {captureMode ? (
          <path
            d={pathData}
            fill="none"
            stroke="rgb(var(--brand))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#lineGlow)"
          />
        ) : (
          <motion.path
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeInOut" }}
            d={pathData}
            fill="none"
            stroke="rgb(var(--brand))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#lineGlow)"
          />
        )}

        {/* Points and Labels */}
        {points.map((p, i) => (
          <g key={p.btn}>
            {/* X Axis Label */}
            <text
              x={p.x}
              y={height}
              // Smart text-anchor to prevent overflow at edges
              textAnchor={
                i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"
              }
              fontSize={12}
              fontWeight={700}
              fontFamily='"Pretendard JP", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif'
              fill="rgb(var(--grey-500))"
            >
              {p.btn}B
            </text>

            {/* Data Point Dot */}
            {captureMode ? (
              <circle
                cx={p.x}
                cy={p.y}
                r={5}
                fill="rgb(var(--surface))"
                stroke="rgb(var(--brand))"
                strokeWidth="2.5"
              />
            ) : (
              <motion.circle
                initial={{ opacity: 0, r: 0 }}
                whileInView={{ opacity: 1, r: 5 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.5 + i * 0.1,
                  duration: 0.3,
                  ease: "easeOut",
                }}
                cx={p.x}
                cy={p.y}
                fill="rgb(var(--surface))"
                stroke="rgb(var(--brand))"
                strokeWidth="2.5"
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// 칭호 시스템
type Achievement = {
  id: string;
  title: string;
  description: string;
  condition: string;
  color: string;
  bgColor: string;
};

function calculateAchievements(data: RecapResult): Achievement[] {
  const achievements: Achievement[] = [];
  const { stats, tiers } = data;

  // 1. 최고 정확도 100% 달성
  if (stats.maxRate === 100) {
    achievements.push({
      id: "perfect-accuracy",
      title: "99% 정확도 1%의 운",
      description: "최고 정확도 100% 달성",
      condition: `최고 정확도 ${formatScore(stats.maxRate)}%`,
      color: "text-amber-600 dark:text-amber-200",
      bgColor: "bg-amber-50 dark:bg-amber-500/20",
    });
  }

  // 2. 퍼펙트 관련 칭호 (중복 불가 - 가장 높은 것만)
  if (stats.perfectCount >= 100) {
    achievements.push({
      id: "perfectionist",
      title: "완벽 주의자",
      description: "퍼펙트 100곡 이상 달성",
      condition: `퍼펙트 플레이 ${formatCount(stats.perfectCount)}곡`,
      color: "text-rose-600 dark:text-rose-200",
      bgColor: "bg-rose-50 dark:bg-rose-500/20",
    });
  } else if (stats.perfectCount === 1) {
    achievements.push({
      id: "first-perfect",
      title: "첫 퍼펙트의 감동",
      description: "첫 번째 퍼펙트 달성",
      condition: `퍼펙트 플레이 ${stats.perfectCount}곡`,
      color: "text-pink-600 dark:text-pink-200",
      bgColor: "bg-pink-50 dark:bg-pink-500/20",
    });
  }

  // 3. 맥스 콤보 관련 칭호 (가장 높은 것만)
  if (stats.maxComboCount >= 500) {
    achievements.push({
      id: "combo-master",
      title: "BREAK가 뭐죠?",
      description: "맥스 콤보 500곡 이상 달성",
      condition: `맥스 콤보 ${formatCount(stats.maxComboCount)}곡`,
      color: "text-purple-600 dark:text-purple-200",
      bgColor: "bg-purple-50 dark:bg-purple-500/20",
    });
  } else if (stats.maxComboCount >= 200) {
    achievements.push({
      id: "combo-focus",
      title: "놓치지 않는 집중력",
      description: "맥스 콤보 200곡 이상 달성",
      condition: `맥스 콤보 ${formatCount(stats.maxComboCount)}곡`,
      color: "text-violet-600 dark:text-violet-200",
      bgColor: "bg-violet-50 dark:bg-violet-500/20",
    });
  } else if (stats.maxComboCount >= 50) {
    achievements.push({
      id: "stable-player",
      title: "안정적인 플레이어",
      description: "맥스 콤보 50곡 이상 달성",
      condition: `맥스 콤보 ${formatCount(stats.maxComboCount)}곡`,
      color: "text-indigo-600 dark:text-indigo-200",
      bgColor: "bg-indigo-50 dark:bg-indigo-500/20",
    });
  }

  // 4. 버튼별 칭호 (가장 높은 비율의 버튼 하나만)
  const buttonTitles: Record<number, string> = {
    4: "4버튼이 진리",
    5: "5버튼 가변은 못 참지",
    6: "난 6버튼이 좋아",
    8: "꿈을 꾸는 8버튼 문어",
  };
  const buttonColors: Record<number, { color: string; bgColor: string }> = {
    4: {
      color: "text-green-600 dark:text-green-200",
      bgColor: "bg-green-50 dark:bg-green-500/20",
    },
    5: {
      color: "text-cyan-600 dark:text-cyan-200",
      bgColor: "bg-cyan-50 dark:bg-cyan-500/20",
    },
    6: {
      color: "text-blue-600 dark:text-blue-200",
      bgColor: "bg-blue-50 dark:bg-blue-500/20",
    },
    8: {
      color: "text-orange-600 dark:text-orange-200",
      bgColor: "bg-orange-50 dark:bg-orange-500/20",
    },
  };

  const maxButton = BUTTONS.reduce(
    (max, btn) =>
      (stats.buttonRatios[btn] ?? 0) > (stats.buttonRatios[max] ?? 0)
        ? btn
        : max,
    BUTTONS[0]
  );

  if (stats.buttonRatios[maxButton] > 0) {
    achievements.push({
      id: `button-${maxButton}`,
      title: buttonTitles[maxButton],
      description: `${maxButton}버튼 플레이 비율 1위`,
      condition: `${maxButton}B 비율 ${formatPercent(
        stats.buttonRatios[maxButton]
      )}%`,
      color: buttonColors[maxButton].color,
      bgColor: buttonColors[maxButton].bgColor,
    });
  }

  // 5. 기록량 관련 칭호 (가장 높은 것만)
  if (stats.totalRecords >= 2000) {
    achievements.push({
      id: "record-effort",
      title: "노력의 결정체",
      description: "기록 2,000개 이상 등록",
      condition: `등록 기록 ${formatCount(stats.totalRecords)}개`,
      color: "text-brand",
      bgColor: "bg-blue-50 dark:bg-blue-500/20",
    });
  } else if (stats.totalRecords >= 500) {
    achievements.push({
      id: "record-diligent",
      title: "성실한 유저",
      description: "기록 500개 이상 등록",
      condition: `등록 기록 ${formatCount(stats.totalRecords)}개`,
      color: "text-sky-600 dark:text-sky-200",
      bgColor: "bg-sky-50 dark:bg-sky-500/20",
    });
  } else if (stats.totalRecords >= 100) {
    achievements.push({
      id: "record-beginner",
      title: "소중한 입문자",
      description: "기록 100개 이상 등록",
      condition: `등록 기록 ${formatCount(stats.totalRecords)}개`,
      color: "text-teal-600 dark:text-teal-200",
      bgColor: "bg-teal-50 dark:bg-teal-500/20",
    });
  }

  // 6. 티어 관련 칭호 (가장 높은 것만)
  const tierNames = BUTTONS.map(
    (btn) => tiers[btn]?.tier?.name?.toLowerCase() || ""
  );

  if (tierNames.some((name) => name.includes("grand master"))) {
    achievements.push({
      id: "tier-grandmaster",
      title: "정상에 서다",
      description: "그랜드 마스터 티어 달성",
      condition: "Grand Master",
      color: "text-yellow-600 dark:text-yellow-200",
      bgColor: "bg-yellow-50 dark:bg-yellow-500/20",
    });
  } else if (
    tierNames.some((name) => name.includes("master") && !name.includes("grand"))
  ) {
    achievements.push({
      id: "tier-master",
      title: "마스터의 경지",
      description: "마스터 티어 달성",
      condition: "Master",
      color: "text-red-600 dark:text-red-200",
      bgColor: "bg-red-50 dark:bg-red-500/20",
    });
  } else if (tierNames.some((name) => name.includes("diamond"))) {
    achievements.push({
      id: "tier-diamond",
      title: "반짝이는 실력",
      description: "다이아몬드 티어 달성",
      condition: "Diamond",
      color: "text-cyan-600 dark:text-cyan-200",
      bgColor: "bg-cyan-50 dark:bg-cyan-500/20",
    });
  } else if (tierNames.some((name) => name.includes("platinum"))) {
    achievements.push({
      id: "tier-platinum",
      title: "상위권의 증표",
      description: "플래티넘 티어 달성",
      condition: "Platinum",
      color: "text-emerald-600 dark:text-emerald-200",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/20",
    });
  }

  // 7. 버튼 컬렉터 - 4개 버튼 모두 기록 있음
  const allButtonsPlayed = BUTTONS.every(
    (btn) => (stats.buttonCounts[btn] ?? 0) > 0
  );
  if (allButtonsPlayed) {
    achievements.push({
      id: "button-collector",
      title: "버튼 컬렉터",
      description: "4개 버튼 모두 플레이",
      condition: "4B, 5B, 6B, 8B 모두 기록",
      color: "text-fuchsia-600 dark:text-fuchsia-200",
      bgColor: "bg-fuchsia-50 dark:bg-fuchsia-500/20",
    });
  }

  return achievements;
}

function RecapGrid({ data }: { data: RecapResult }) {
  const { stats } = data;
  const topDlc = stats.topTierPointDlc;
  const dlcValue = topDlc ? topDlc.name : "기록 없음";
  const dlcSubtitle = topDlc
    ? `포인트 합계 ${formatScore(topDlc.tierPointSum)}`
    : "기록 없음";

  const cards = [
    {
      title: "등록 기록",
      value: `${formatCount(stats.totalRecords)}`,
      unit: "개",
      subtitle: `총 클리어 패턴 ${formatCount(data.totalClearedPatterns)}개`,
      accentColor: "text-brand",
    },
    {
      title: "평균 정확도",
      value: `${formatScore(stats.averageRate)}`,
      unit: "%",
      subtitle: "전체 기록 평균",
      accentColor: "text-green-500 dark:text-green-300",
    },
    {
      title: "최고 정확도",
      value: `${formatScore(stats.maxRate)}`,
      unit: "%",
      subtitle: "Best Rate",
      accentColor: "text-amber-500 dark:text-amber-300",
    },
    {
      title: "맥스 콤보",
      value: `${formatCount(stats.maxComboCount)}`,
      unit: "곡",
      subtitle: "BREAK 없이 클리어",
      accentColor: "text-purple-500 dark:text-purple-300",
    },
    {
      title: "퍼펙트 플레이",
      value: `${formatCount(stats.perfectCount)}`,
      unit: "곡",
      subtitle: "짜릿한 100% 달성",
      accentColor: "text-rose-500 dark:text-rose-300",
    },
    {
      title: "티어 포인트 높은 팩",
      value: dlcValue,
      unit: "",
      subtitle: dlcSubtitle,
      accentColor: "text-indigo-500 dark:text-indigo-300",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <div key={index} className="ui-card hover:bg-surface-hover">
          <p className="text-sm font-bold text-grey-500">{card.title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <h3 className={`text-3xl font-bold ${card.accentColor}`}>
              {card.value}
            </h3>
            <span className="text-lg font-medium text-grey-700">
              {card.unit}
            </span>
          </div>
          <p className="mt-2 text-sm text-grey-400">{card.subtitle}</p>
        </div>
      ))}
    </section>
  );
}

function RecapSkeleton() {
  return (
    <SkeletonTheme
      baseColor="rgb(var(--skeleton-base))"
      highlightColor="rgb(var(--skeleton-highlight))"
    >
      <div className="flex flex-col gap-4">
        {/* Metric Cards Skeleton - matches RecapGrid exactly */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ui-card">
              <p className="text-sm font-bold text-grey-500">
                <Skeleton width={100} />
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <h3 className="text-3xl font-bold opacity-20">
                  <Skeleton width={80} />
                </h3>
                <span className="text-lg font-medium opacity-20">
                  <Skeleton width={20} />
                </span>
              </div>
              <p className="mt-2 text-sm text-grey-400">
                <Skeleton width={150} />
              </p>
            </div>
          ))}
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Play Style Skeleton - matches actual section */}
          <section className="ui-card flex flex-col h-full">
            <h2 className="section-title">
              <Skeleton width={100} />
            </h2>
            <div className="mt-4 flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span className="text-grey-700">
                      <Skeleton width={70} />
                    </span>
                    <span className="text-grey-900">
                      <Skeleton width={40} />
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-grey-100 overflow-hidden">
                    <Skeleton
                      height={12}
                      borderRadius={999}
                      containerClassName="block h-full"
                    />
                  </div>
                  <p className="mt-0.5 text-right text-xs font-medium text-grey-500">
                    <Skeleton width={35} />
                  </p>
                </div>
              ))}
            </div>
            {/* Chart placeholder - matches PlayStyleLineChart height */}
            <div
              className="flex-1 flex items-end justify-center mt-2 min-w-0 w-full"
              style={{ height: "240px" }}
            >
              <Skeleton width="100%" height="100%" borderRadius={0} />
            </div>
          </section>

          {/* Top DJ Power Skeleton - matches actual DJ Power cards */}
          <section className="ui-card md:col-span-2">
            <h2 className="section-title">
              <Skeleton width={140} />
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl bg-grey-50 p-4"
                >
                  {/* h-20 w-20 = 80px */}
                  <div className="h-20 w-20 shrink-0 rounded-lg overflow-hidden">
                    <Skeleton
                      height="100%"
                      containerClassName="flex h-full w-full"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-grey-500">
                        <Skeleton width={85} />
                      </p>
                      <span className="text-[10px] font-medium text-grey-500 bg-surface px-1.5 py-0.5 rounded border border-grey-100 opacity-50">
                        <Skeleton width={30} />
                      </span>
                    </div>
                    <p className="text-lg font-bold text-grey-900 -mt-0.5">
                      <Skeleton width={140} />
                    </p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight bg-grey-100 text-grey-600 opacity-50">
                        <Skeleton width={40} />
                      </span>
                      <span className="text-lg font-bold text-brand">
                        <Skeleton width={65} />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tier Skeleton - matches TierVideoList exactly */}
          <section className="ui-card md:col-span-3">
            <h2 className="section-title">
              <Skeleton width={70} />
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl bg-grey-50 p-4"
                >
                  {/* h-20 w-20 = 80px, rounded-xl */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-grey-200">
                    <Skeleton
                      height="100%"
                      containerClassName="flex h-full w-full"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="text-xs font-bold text-grey-500 mb-0.5">
                      <Skeleton width={55} />
                    </p>
                    <h4 className="truncate text-xl font-bold text-grey-900">
                      <Skeleton width={110} />
                    </h4>
                    <p className="text-base font-bold text-brand">
                      <Skeleton width={70} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Top 5 Skeleton - matches TopList exactly */}
          <section className="ui-card md:col-span-3">
            <h2 className="section-title">
              <Skeleton width={90} />
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-2xl bg-grey-50 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-y-2 mb-4">
                    <h3 className="text-lg font-bold text-grey-900 flex items-center gap-2">
                      <Skeleton width={85} />
                    </h3>
                    <span className="text-xs font-bold text-grey-500 bg-surface px-2 py-1 rounded-full border border-grey-100 opacity-50">
                      <Skeleton width={100} />
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-3 rounded-xl bg-surface p-3 border border-grey-100"
                      >
                        {/* h-6 w-6 = 24px circle */}
                        <Skeleton circle width={24} height={24} />
                        {/* h-12 w-12 = 48px */}
                        <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden">
                          <Skeleton
                            height="100%"
                            containerClassName="flex h-full w-full"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="truncate text-sm font-bold text-grey-900">
                            <Skeleton width="65%" />
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight bg-grey-100 text-grey-600 opacity-50">
                              <Skeleton width={32} />
                            </span>
                            <span className="text-xs font-medium text-grey-500">
                              <Skeleton width={55} />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </SkeletonTheme>
  );
}

function RecapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { nickname, setNickname } = useNicknameStore();
  const nicknameParam = searchParams.get("nickname")?.trim();
  const activeNickname = nicknameParam || nickname;

  useEffect(() => {
    if (nicknameParam && nicknameParam !== nickname) {
      setNickname(nicknameParam);
    }
  }, [nicknameParam, nickname, setNickname]);

  const rangeStart = useMemo(() => new Date(RANGE_START_ISO), []);
  const rangeEnd = useMemo(() => new Date(RANGE_END_ISO), []);
  const rangeLabel = "2025년";

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["recap", activeNickname, rangeLabel],
    queryFn: () => fetchRecapData(activeNickname, rangeStart, rangeEnd),
    enabled: Boolean(activeNickname),
    staleTime: 5 * 60 * 1000, // 5분간 데이터를 fresh로 유지 (재요청 방지)
    gcTime: 30 * 60 * 1000, // 30분간 캐시 유지
  });

  // 페이지 저장 기능
  const mainRef = useRef<HTMLElement>(null);
  const { isSaving, saveAsImage } = useImageSaver();
  const [isCapturing, setIsCapturing] = useState(false);
  const [hideNickname, setHideNickname] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const shouldHideRef = useRef(false);

  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSave = (shouldHide: boolean) => {
    setShowConfirmModal(false);
    shouldHideRef.current = shouldHide;

    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = shouldHide
      ? `2025_recap_${dateStr}.png`
      : `${activeNickname}_2025_recap_${dateStr}.png`;

    setCaptureProgress(0);
    saveAsImage(mainRef, {
      fileName,
      pixelRatio: 3,
      onProgress: (value) => {
        setCaptureProgress((prev) => Math.max(prev, value));
      },
      onBeforeCapture: async () => {
        setIsCapturing(true);
        if (shouldHideRef.current) {
          setHideNickname(true);
        }
        // requestAnimationFrame 2회로 렌더링 보장 (iOS 호환성 개선)
        await new Promise(resolve => requestAnimationFrame(() => resolve(null)));
        await new Promise(resolve => requestAnimationFrame(() => resolve(null)));
      },
      onAfterCapture: () => {
        setIsCapturing(false);
        setHideNickname(false);
        setCaptureProgress(0);
      },
    });
  };

  return (
    <>
      <main
        ref={mainRef}
        className="recap-root min-h-screen w-full bg-canvas pt-10"
      >
        <div className="recap-container mx-auto max-w-5xl px-0 md:px-6">
          {/* Navigation */}
          <header className="recap-header mb-12 flex items-center justify-between px-6 md:px-0">
            <button
              onClick={() => {
                router.replace("/recap");
              }}
              className="flex items-center gap-2 text-grey-600 hover:text-grey-900 transition-colors"
            >
              <ArrowLeft size={24} />
              <span className="text-lg font-bold">홈으로</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveClick}
                disabled={isSaving || isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand text-white font-bold text-sm hover:bg-brand-strong transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                <span>{isSaving ? "저장 중..." : "저장"}</span>
              </button>
            </div>
          </header>

          {/* Header */}
          <div className="recap-title mb-4 px-6 md:px-0">
            <h1 className="text-4xl font-bold text-grey-900 md:text-5xl leading-[1.1] md:leading-[1.1]">
              <span
                className={hideNickname ? "inline-block blur-[16px] select-none" : ""}
              >
                {activeNickname}
              </span>
              님의
              <br />
              <span className="text-brand">2025년 DJMAX</span>
            </h1>
            <p className="mt-4 text-grey-600">
              올해 기록된 모든 플레이 데이터를 분석했어요.
            </p>

            {(isLoading || data) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {isLoading ? (
                  <SkeletonTheme
                    baseColor="rgb(var(--skeleton-base))"
                    highlightColor="rgb(var(--skeleton-highlight))"
                  >
                    {Array.from({ length: 3 }).map((_, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-grey-100/50"
                      >
                        <Skeleton
                          width={i === 0 ? 80 : i === 1 ? 60 : 100}
                          height={16}
                          className="align-middle"
                        />
                      </span>
                    ))}
                  </SkeletonTheme>
                ) : (
                  calculateAchievements(data!).map((achievement) => (
                    <Tooltip
                      key={achievement.id}
                      content={
                        <span className="font-bold">
                          {achievement.description}
                        </span>
                      }
                    >
                      <span
                        className={`cursor-help inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${achievement.bgColor} ${achievement.color} transition-colors hover:brightness-95`}
                      >
                        {achievement.title}
                      </span>
                    </Tooltip>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-4">
            {isLoading && <RecapSkeleton />}

            {isError &&
              !(error instanceof VArchiveError && error.code === 101) && (
                <div className="glass-card flex flex-col items-center text-center p-12">
                  <p className="text-xl font-bold text-grey-800">
                    기록을 불러오지 못했어요
                  </p>
                  <p className="mt-2 text-grey-500">
                    잠시 후 다시 시도해주시겠어요?
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="mt-6 flex items-center gap-2 rounded-full bg-grey-800 px-6 py-3 text-white transition-colors hover:bg-black dark:bg-grey-200 dark:text-grey-900 dark:hover:bg-grey-300"
                  >
                    <RefreshCcw size={18} />
                    다시 시도
                  </button>
                </div>
              )}

            {data && (
              <>
                <RecapGrid data={data} />

                <div className="grid gap-4 md:grid-cols-3">
                  <section className="ui-card flex flex-col h-full">
                    <h2 className="section-title">플레이 스타일</h2>
                    <div className="mt-4 flex flex-col gap-2">
                      {BUTTONS.map((button) => {
                        const ratio = data.stats.buttonRatios[button] ?? 0;
                        const count = data.stats.buttonCounts[button] ?? 0;
                        return (
                          <div key={button} className="group">
                            <div className="flex justify-between text-sm font-medium mb-1">
                              <span className="text-grey-700">
                                {button} BUTTON
                              </span>
                              <span className="text-grey-900">
                                {formatPercent(ratio)}%
                              </span>
                            </div>
                            <div className="h-3 w-full rounded-full bg-grey-100 overflow-hidden">
                              {isCapturing ? (
                                <div
                                  className="h-full rounded-full bg-brand"
                                  style={{ width: `${Math.min(ratio, 100)}%` }}
                                />
                              ) : (
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{
                                    width: `${Math.min(ratio, 100)}%`,
                                  }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 1, ease: "circOut" }}
                                  className="h-full rounded-full bg-brand group-hover:bg-brand-strong transition-colors"
                                />
                              )}
                            </div>
                            <p className="mt-0.5 text-right text-xs font-medium text-grey-500">
                              {formatCount(count)}개
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex-1 flex items-center justify-center mt-2 min-w-0 w-full">
                      <PlayStyleLineChart
                        stats={data.stats}
                        captureMode={isCapturing}
                      />
                    </div>
                  </section>

                  <section className="ui-card md:col-span-2">
                    <h2 className="section-title">최고 DJ POWER 기록</h2>
                    <div className="mt-6 grid grid-cols-1 gap-4">
                      {BUTTONS.map((button) => {
                        const entry = data.stats.topDjpowerByButton[button];
                        if (!entry) {
                          return (
                            <div
                              key={button}
                              className="flex h-[117px] items-center gap-4 rounded-xl bg-grey-50 p-4"
                            >
                              <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg bg-grey-200 text-grey-400">
                                <Disc size={24} className="opacity-50" />
                                <span className="text-[10px] font-bold">
                                  NO DATA
                                </span>
                              </div>
                              <div className="flex flex-col justify-center gap-1">
                                <p className="text-xs font-bold text-grey-500">
                                  {button}B DJ POWER
                                </p>
                                <p className="text-sm text-grey-400">
                                  기록 없음
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={button}
                            className="flex items-center gap-4 rounded-xl bg-grey-50 p-4 hover:bg-grey-100 transition-colors"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element -- keep <img> so capture includes jackets reliably */}
                            <img
                              src={`https://v-archive.net/static/images/jackets/${entry.title}.jpg`}
                              alt={entry.name}
                              className="h-20 w-20 rounded-lg object-cover shadow-sm"
                              loading="lazy"
                            />
                            <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <p className="text-xs font-bold text-grey-500">
                                  {button}B DJ POWER
                                </p>
                                <span className="text-[10px] font-medium text-grey-500 bg-surface px-1.5 py-0.5 rounded border border-grey-100 whitespace-nowrap">
                                  {entry.dlc}
                                </span>
                              </div>
                              <p
                                className="text-lg font-bold text-grey-900 truncate -mt-0.5"
                                title={entry.name}
                              >
                                {entry.name}
                              </p>
                              <div className="flex items-center justify-between mt-0.5">
                                <span
                                  className={`
                                px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight
                                ${entry.pattern.startsWith("SC")
                                      ? "bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200"
                                      : "bg-grey-100 text-grey-600"
                                    }
                              `}
                                >
                                  {entry.pattern}
                                </span>
                                <span className="text-lg font-bold text-brand">
                                  {formatScore(entry.score)}% /{" "}
                                  {formatScore(entry.djpower)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="ui-card md:col-span-3">
                    <h2 className="section-title">달성 티어</h2>
                    <TierVideoList tiers={data.tiers} />
                  </section>

                  <section className="ui-card md:col-span-3">
                    <h2 className="section-title">성과표 TOP 포인트</h2>
                    <TopList tiers={data.tiers} />
                  </section>
                </div>
              </>
            )}
          </div>
          <footer className="recap-footer recap-footer--capture w-full text-center text-sm text-grey-500 py-5">
            <p>
              Developed by{" "}
              <span className="font-medium text-grey-700">DM Note</span> · API
              provided by{" "}
              <span className="font-medium text-grey-700">V-ARCHIVE</span>
            </p>
          </footer>
        </div>

        {/* Footer */}
        <footer className="recap-footer recap-footer--page w-full text-center text-sm text-grey-500 py-5">
          <p>
            Developed by{" "}
            <span className="font-medium text-grey-700">DM Note</span> · API
            provided by{" "}
            <span className="font-medium text-grey-700">V-ARCHIVE</span>
          </p>
        </footer>
      </main>

      {/* 닉네임 가리기 확인 모달 */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center backdrop-blur-md bg-canvas/80"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="bg-surface rounded-[24px] p-5 mx-4 max-w-xs w-full"
            style={{ boxShadow: "0 0 24px rgba(0, 0, 0, 0.03)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-bold text-grey-900 text-center mb-4">
              닉네임 가려드릴까여?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleConfirmSave(false)}
                className="flex-1 py-2.5 rounded-[12px] bg-grey-100 text-grey-700 font-bold text-sm hover:bg-grey-200 transition-colors"
              >
                아니여
              </button>
              <button
                onClick={() => handleConfirmSave(true)}
                className="flex-1 py-2.5 rounded-[12px] bg-brand text-white font-bold text-sm hover:bg-brand-strong transition-colors"
              >
                넹
              </button>
            </div>
          </div>
        </div>
      )}

      {isSaving && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-canvas"
          role="status"
          aria-live="polite"
          aria-label="이미지 저장 중"
        >
          <div className="flex flex-col items-center gap-6">
            <p className="text-lg font-semibold text-grey-700 text-center">
              <span className="block">소중한 기록을 저장하는 중이에요!</span>
              <span className="block">잠시만 기다려주세요..</span>
            </p>
            <div className="h-2.5 w-72 overflow-hidden rounded-full bg-grey-300">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-blue-400 transition-[width] duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(5, captureProgress))}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function RecapResult() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen w-full bg-canvas pt-10">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center py-20">
              <div className="text-grey-600">로딩 중...</div>
            </div>
          </div>
        </main>
      }
    >
      <RecapContent />
    </Suspense>
  );
}
