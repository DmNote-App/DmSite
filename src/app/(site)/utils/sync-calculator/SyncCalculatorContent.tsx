"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLanguage } from "../../i18n";
import { Reveal } from "../../Reveal";
import {
  GAP_MAX,
  GAP_MIN,
  OFFSET_MAX,
  OFFSET_MIN,
  TRACK_HEIGHT_MAX,
  TRACK_HEIGHT_MIN,
  calcSync,
  clampInt,
  snapSpeed,
} from "./calc";
import { DEFAULT_PROFILE_ID, GAME_PROFILES, getProfile } from "./gameProfiles";

const STORAGE_KEY = "dm-note-sync-calc-v1";

type FormState = {
  profileId: string;
  speed: string;
  trackHeight: string;
  delayNoteEnabled: boolean;
  gapMs: string;
  offsetMs: string;
};

// 입력 필드는 타이핑 중인 값을 그대로 두려고 string으로 보관
const DEFAULT_FORM: FormState = {
  profileId: DEFAULT_PROFILE_ID,
  speed: "",
  trackHeight: "150",
  delayNoteEnabled: false,
  gapMs: "120",
  offsetMs: "0",
};

// localStorage 복원값 검증 — 깨진 필드는 기본값으로
function sanitizeForm(raw: unknown): FormState {
  const r = (typeof raw === "object" && raw !== null ? raw : {}) as Record<
    string,
    unknown
  >;
  const str = (v: unknown, fallback: string) =>
    typeof v === "string" ? v : fallback;
  return {
    profileId: GAME_PROFILES.some((p) => p.id === r.profileId)
      ? (r.profileId as string)
      : DEFAULT_FORM.profileId,
    speed: str(r.speed, DEFAULT_FORM.speed),
    trackHeight: str(r.trackHeight, DEFAULT_FORM.trackHeight),
    delayNoteEnabled:
      typeof r.delayNoteEnabled === "boolean"
        ? r.delayNoteEnabled
        : DEFAULT_FORM.delayNoteEnabled,
    gapMs: str(r.gapMs, DEFAULT_FORM.gapMs),
    offsetMs: str(r.offsetMs, DEFAULT_FORM.offsetMs),
  };
}

export function SyncCalculatorContent() {
  const { t } = useLanguage();
  const tr = t.utils.sync;

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [restored, setRestored] = useState(false);

  // 첫 렌더는 SSR과 같은 기본값 → mount 후 저장값 복원 (hydration mismatch 방지)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setForm(sanitizeForm(JSON.parse(raw)));
    } catch {
      // 깨진 저장값은 무시하고 기본값 사용
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // 저장 실패(프라이빗 모드, 쿼터 초과)해도 계산기는 계속 동작
    }
  }, [form, restored]);

  const profile = getProfile(form.profileId);
  const speedDecimals = String(profile.speedStep).split(".")[1]?.length ?? 0;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // blur 시 표시값을 스텝 그리드·유효 범위로 정규화
  const normalizeSpeed = () => {
    const v = Number(form.speed);
    if (!form.speed.trim() || !Number.isFinite(v)) return;
    set("speed", snapSpeed(v, profile).toFixed(speedDecimals));
  };

  const normalizeInt =
    (key: "trackHeight" | "gapMs" | "offsetMs", min: number, max: number) =>
    () => {
      const raw = form[key];
      const v = Number(raw);
      if (!raw.trim() || !Number.isFinite(v)) return;
      set(key, String(clampInt(v, min, max)));
    };

  const result = useMemo(() => {
    if (!form.speed.trim() || !form.trackHeight.trim()) return null;
    const speed = Number(form.speed);
    const trackHeight = Number(form.trackHeight);
    if (!Number.isFinite(speed) || speed <= 0) return null;
    if (!Number.isFinite(trackHeight) || trackHeight <= 0) return null;

    // 타이핑 중인 값도 항상 유효 범위로 눌러서 계산
    return calcSync({
      t0Ms: profile.t0Ms,
      speed: snapSpeed(speed, profile),
      trackHeightPx: clampInt(trackHeight, TRACK_HEIGHT_MIN, TRACK_HEIGHT_MAX),
      delayNoteEnabled: form.delayNoteEnabled,
      gapMs: form.delayNoteEnabled
        ? clampInt(Number(form.gapMs) || 0, GAP_MIN, GAP_MAX)
        : 0,
      offsetMs: clampInt(Number(form.offsetMs) || 0, OFFSET_MIN, OFFSET_MAX),
    });
  }, [form, profile]);

  return (
    <div className="landing-bg relative z-10 min-h-screen text-grey-900 font-sans selection:bg-accent-500 selection:text-white">
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32">
        <div className="site-rail">
          <Reveal>
            <Link
              href="/utils"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-grey-400 transition-colors hover:text-grey-900"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M13 8H3m0 0l4-4m-4 4l4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t.utils.title}
            </Link>
          </Reveal>
          <Reveal delay={40}>
            <h1 className="mt-5 text-headline font-semibold text-grey-900">
              {tr.title}
            </h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-4 max-w-2xl text-lead font-normal whitespace-pre-line text-grey-400 break-keep">
              {tr.description}
            </p>
          </Reveal>

          <Reveal delay={140} className="mt-12 max-w-3xl">
            <div className="dm-card p-6 md:p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[13px] font-medium text-grey-500">
                    {tr.form.profile}
                  </span>
                  <span className="text-sm font-medium text-grey-700">
                    {profile.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field label={tr.form.speed}>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={profile.speedMin}
                      max={profile.speedMax}
                      step={profile.speedStep}
                      placeholder="7.4"
                      value={form.speed}
                      onChange={(e) => set("speed", e.target.value)}
                      onBlur={normalizeSpeed}
                      className="dm-input"
                    />
                  </Field>
                  <Field
                    label={tr.form.trackHeight}
                    hint={tr.form.trackHeightHint}
                  >
                    <input
                      type="number"
                      inputMode="numeric"
                      min={TRACK_HEIGHT_MIN}
                      max={TRACK_HEIGHT_MAX}
                      value={form.trackHeight}
                      onChange={(e) => set("trackHeight", e.target.value)}
                      onBlur={normalizeInt(
                        "trackHeight",
                        TRACK_HEIGHT_MIN,
                        TRACK_HEIGHT_MAX,
                      )}
                      className="dm-input"
                    />
                  </Field>
                </div>
              </div>

              <div className="mt-7 border-t border-white/5 pt-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-grey-700">
                    {tr.form.delayNote}
                  </span>
                  <Switch
                    checked={form.delayNoteEnabled}
                    onChange={(v) => set("delayNoteEnabled", v)}
                    label={tr.form.delayNote}
                  />
                </div>
                <p className="mt-2 max-w-md text-[13px] leading-5 text-grey-400 break-keep">
                  {tr.form.delayNoteHint}
                </p>
                {form.delayNoteEnabled && (
                  <div className="mt-5 max-w-xs">
                    <Field label={tr.form.gap}>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={GAP_MIN}
                        max={GAP_MAX}
                        value={form.gapMs}
                        onChange={(e) => set("gapMs", e.target.value)}
                        onBlur={normalizeInt("gapMs", GAP_MIN, GAP_MAX)}
                        className="dm-input"
                      />
                    </Field>
                  </div>
                )}
              </div>

              <div className="mt-7 border-t border-white/5 pt-6">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-grey-500 transition-colors select-none hover:text-grey-900 [&::-webkit-details-marker]:hidden">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                      className="transition-transform group-open:rotate-90"
                    >
                      <path
                        d="m6 4 4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {tr.form.advanced}
                  </summary>
                  <div className="mt-5 max-w-xs">
                    <Field label={tr.form.offset} hint={tr.form.offsetHint}>
                      <input
                        type="number"
                        min={OFFSET_MIN}
                        max={OFFSET_MAX}
                        value={form.offsetMs}
                        onChange={(e) => set("offsetMs", e.target.value)}
                        onBlur={normalizeInt(
                          "offsetMs",
                          OFFSET_MIN,
                          OFFSET_MAX,
                        )}
                        className="dm-input"
                      />
                    </Field>
                  </div>
                </details>
              </div>

              {/* 결과 리드아웃 — 카드 안에서 입력 아래에 붙는 패널 */}
              <div className="mt-8 rounded-xl bg-surface p-5 md:p-6">
                <h2 className="text-[13px] font-medium text-grey-500">
                  {tr.result.title}
                </h2>
                <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <ResultValue
                    label={tr.result.noteSpeed}
                    hint={tr.result.noteSpeedHint}
                    value={result?.noteSpeedPxPerSec ?? null}
                    unit="px/s"
                    copyLabel={tr.result.copy}
                    copiedLabel={tr.result.copied}
                  />
                  <ResultValue
                    label={tr.result.obsDelay}
                    hint={tr.result.obsDelayHint}
                    value={result?.obsDelayMs ?? null}
                    unit="ms"
                    copyLabel={tr.result.copy}
                    copiedLabel={tr.result.copied}
                  />
                </div>

                {result && result.obsDelayRawMs < 0 && (
                  <p className="mt-4 text-[13px] leading-5 text-amber-400 break-keep">
                    {tr.result.negativeWarning}
                  </p>
                )}

                {result && result.filterSplit.length > 1 && (
                  <div className="mt-4">
                    <p className="text-[13px] leading-5 text-grey-400 break-keep">
                      {tr.result.filterSplit}
                    </p>
                    <p className="mt-1 text-sm font-medium text-grey-900 tabular-nums">
                      {result.filterSplit.join(" + ")} ms
                    </p>
                  </div>
                )}

                <p className="mt-6 border-t border-white/5 pt-5 text-[13px] leading-5 text-grey-400 break-keep tabular-nums">
                  {result
                    ? `${tr.result.gameFall} · ${result.gameFallMs.toFixed(1)} ms`
                    : tr.result.unavailable}
                </p>
              </div>
            </div>
          </Reveal>

          {/* 주의사항 */}
          <Reveal delay={80}>
            <div className="mt-16 max-w-3xl">
              <h2 className="text-sm font-medium text-grey-500">
                {tr.notes.title}
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-grey-400 break-keep marker:text-grey-200">
                <li>{tr.notes.reverse}</li>
                <li>{tr.notes.variableBpm}</li>
                <li>{tr.notes.recalc}</li>
                <li>{tr.notes.obsSetup}</li>
                <li>{tr.notes.audio}</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-grey-500">
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
      {hint && (
        <span className="mt-2 block text-[13px] leading-5 text-grey-300 break-keep">
          {hint}
        </span>
      )}
    </label>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[26px] w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 ${
        checked ? "bg-accent-500" : "bg-grey-200"
      }`}
    >
      <span
        className={`absolute top-[3px] left-[3px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[18px]" : ""
        }`}
      />
    </button>
  );
}

function ResultValue({
  label,
  hint,
  value,
  unit,
  copyLabel,
  copiedLabel,
}: {
  label: string;
  hint: string;
  value: number | null;
  unit: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <p className="text-[13px] font-medium text-grey-500">{label}</p>
        {value !== null && (
          <CopyButton
            value={String(value)}
            label={copyLabel}
            copiedLabel={copiedLabel}
          />
        )}
      </div>
      <p
        className={`mt-2 text-4xl leading-none font-semibold tracking-tight tabular-nums ${
          value !== null ? "text-grey-900" : "text-grey-200"
        }`}
      >
        {value !== null ? value.toLocaleString("en-US") : "—"}
        <span className="ml-1.5 text-lg font-normal tracking-normal text-grey-400">
          {unit}
        </span>
      </p>
      <p className="mt-2 text-[13px] leading-5 text-grey-300 break-keep">
        {hint}
      </p>
    </div>
  );
}

function CopyButton({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // 클립보드 접근이 막힌 환경 — 값이 화면에 있으니 조용히 넘어감
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`-mt-1 shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
        copied
          ? "text-accent-500"
          : "text-grey-400 hover:bg-surface-hover hover:text-grey-900"
      }`}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
