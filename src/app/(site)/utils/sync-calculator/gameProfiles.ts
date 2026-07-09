// 게임별 낙하 시간 프로필 — t0Ms는 1.0배속에서 노트가 가상 원점(화면 최상단)에서
// 판정선까지 내려오는 실측 시간. DJMAX RESPECT V는 240fps 녹화 분석으로 확정
export type GameProfile = {
  id: string;
  name: string;
  t0Ms: number;
  speedMin: number;
  speedMax: number;
  speedStep: number;
};

export const GAME_PROFILES: readonly GameProfile[] = [
  {
    id: "djmax-respect-v",
    name: "DJMAX RESPECT V",
    t0Ms: 2693,
    speedMin: 1.0,
    speedMax: 9.0,
    speedStep: 0.1,
  },
];

export const DEFAULT_PROFILE_ID = GAME_PROFILES[0].id;

export function getProfile(id: string): GameProfile {
  return GAME_PROFILES.find((p) => p.id === id) ?? GAME_PROFILES[0];
}
