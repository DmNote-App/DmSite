// DJMAX ↔ DM NOTE 노트 낙하 동기화 계산
// 동기화 조건: 노트가 트랙을 다 내려오는 시간 = 게임 노트 낙하 시간 = OBS 렌더 지연량
import type { GameProfile } from "./gameProfiles";

// OBS 렌더 지연 필터는 개당 최대 500ms — 초과분은 필터를 스택해서 커버
export const OBS_FILTER_MAX_MS = 500;

// DmNote 노트 설정과 동일한 범위
export const TRACK_HEIGHT_MIN = 20;
export const TRACK_HEIGHT_MAX = 2000;
export const GAP_MIN = 0;
export const GAP_MAX = 1000;
export const OFFSET_MIN = -1000;
export const OFFSET_MAX = 1000;

export type SyncInput = {
  t0Ms: number;
  speed: number;
  trackHeightPx: number;
  delayNoteEnabled: boolean;
  gapMs: number;
  offsetMs: number;
};

export type SyncResult = {
  gameFallMs: number;
  noteSpeedPxPerSec: number;
  obsDelayRawMs: number;
  obsDelayMs: number;
  filterSplit: number[];
};

export function calcSync(input: SyncInput): SyncResult {
  const gameFallMs = input.t0Ms / input.speed;
  const noteSpeedPxPerSec = Math.round((input.trackHeightPx * 1000) / gameFallMs);
  // 딜레이 노트 모드는 노트 생성을 구분 시간만큼 늦추므로 지연에 그대로 가산
  const obsDelayRawMs = Math.round(
    gameFallMs + (input.delayNoteEnabled ? input.gapMs : 0) + input.offsetMs
  );
  const obsDelayMs = Math.max(0, obsDelayRawMs);

  return {
    gameFallMs,
    noteSpeedPxPerSec,
    obsDelayRawMs,
    obsDelayMs,
    filterSplit: splitObsDelay(obsDelayMs),
  };
}

// 629 → [500, 129], 500 이하는 [n]
export function splitObsDelay(
  delayMs: number,
  maxPerFilter: number = OBS_FILTER_MAX_MS
): number[] {
  // 비유한 입력이면 루프가 끝나지 않으므로 그대로 반환
  if (!Number.isFinite(delayMs) || maxPerFilter <= 0) return [delayMs];
  const filters: number[] = [];
  let remaining = delayMs;
  while (remaining > maxPerFilter) {
    filters.push(maxPerFilter);
    remaining -= maxPerFilter;
  }
  filters.push(remaining);
  return filters;
}

// 배속을 프로필 스텝 그리드에 스냅하고 범위로 클램프 (0.1×74 = 7.4000…4 같은 부동소수점 제거)
export function snapSpeed(value: number, profile: GameProfile): number {
  const inv = Math.round(1 / profile.speedStep);
  const snapped = Math.round(value * inv) / inv;
  return Math.min(profile.speedMax, Math.max(profile.speedMin, snapped));
}

export function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}
