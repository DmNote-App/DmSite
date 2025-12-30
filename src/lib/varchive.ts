import axios from "axios";
import api from "./api";
import { promisePool } from "./promisePool";
import { deriveRecapStats, type RecordItem, type RecapStats } from "./recap";

export const BUTTONS = [4, 5, 6, 8] as const;
export const BOARDS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "MX",
  "SC",
  "SC5",
  "SC10",
  "SC15"
] as const;

export type VArchiveTier = {
  rating: number;
  name: string;
  code: string;
};

export type TierResponse = {
  success: boolean;
  top50sum: number;
  tierPoint: number;
  tier: VArchiveTier;
  next: VArchiveTier;
  topList: Array<{
    title: number;
    name: string;
    button: number;
    pattern: string;
    level: number;
    floor: string;
    maxRating: string;
    score: string;
    maxCombo: number;
    rating: string;
    updatedAt: string;
  }>;
};

type PatternRecord = {
  title: number;
  name: string;
  composer: string;
  pattern: string;
  score: string | null;
  maxCombo: number | null;
  djpower: number;
  rating: number;
  updatedAt: string | null;
  dlc: string;
  dlcCode: string;
};

type BoardResponse = {
  success: boolean;
  board: string;
  button: string;
  totalCount: number;
  floors: Array<{
    floorNumber: number;
    patterns: PatternRecord[];
  }>;
};

export type RecapResult = {
  nickname: string;
  rangeStartISO: string;
  stats: RecapStats;
  tiers: Record<number, TierResponse | null>;
  totalPatterns: number;
  totalClearedPatterns: number;
};

export class VArchiveError extends Error {
  code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = "VArchiveError";
    this.code = code;
  }
}

const jsonHeaders = { "Content-Type": "application/json" };

async function fetchBoard(
  nickname: string,
  button: number,
  board: string
): Promise<BoardResponse> {
  try {
    const response = await api.get<BoardResponse>(
      `/api/archive/${encodeURIComponent(nickname)}/board/${button}/${board}`,
      { headers: jsonHeaders }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const code = (error.response?.data as { errorCode?: number } | undefined)
        ?.errorCode;
      if (code === 101) {
        throw new VArchiveError("NOT_FOUND", code);
      }
      if (code === 900) {
        throw new VArchiveError("INVALID_BOARD", code);
      }
    }
    throw error;
  }
}

async function fetchTier(
  nickname: string,
  button: number
): Promise<TierResponse | null> {
  try {
    const response = await api.get<TierResponse>(
      `/api/archive/${encodeURIComponent(nickname)}/tier/${button}`,
      { headers: jsonHeaders }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const code = (error.response?.data as { errorCode?: number } | undefined)
        ?.errorCode;
      if (code === 111) {
        return null;
      }
      if (code === 101) {
        throw new VArchiveError("NOT_FOUND", code);
      }
    }
    throw error;
  }
}

type RecordCollector = {
  recordMap: Map<string, RecordItem>;
  patternKeys: Set<string>;
  clearedPatternKeys: Set<string>;
};

function collectRecordsFromBoard(
  board: BoardResponse,
  rangeStart: Date,
  rangeEnd: Date | undefined,
  collector: RecordCollector
) {
  const { recordMap, patternKeys, clearedPatternKeys } = collector;
  const button = Number(board.button);
  for (const floor of board.floors ?? []) {
    for (const pattern of floor.patterns ?? []) {
      const baseKey = `${pattern.title}-${button}-${pattern.pattern}`;
      patternKeys.add(baseKey);
      if (!pattern.score || !pattern.updatedAt) {
        continue;
      }
      const updatedAt = new Date(pattern.updatedAt);
      if (Number.isNaN(updatedAt.getTime())) {
        continue;
      }
      const score = Number.parseFloat(pattern.score);
      if (Number.isNaN(score)) {
        continue;
      }
      if (updatedAt < rangeStart) {
        continue;
      }
      if (rangeEnd && updatedAt >= rangeEnd) {
        continue;
      }
      clearedPatternKeys.add(baseKey);

      const existing = recordMap.get(baseKey);
      if (!existing || updatedAt > existing.updatedAt) {
        recordMap.set(baseKey, {
          title: pattern.title,
          name: pattern.name,
          dlc: pattern.dlc,
          dlcCode: pattern.dlcCode,
          button,
          pattern: pattern.pattern,
          score,
          maxCombo: pattern.maxCombo ?? 0,
          djpower: pattern.djpower ?? 0,
          rating: Number.isFinite(pattern.rating) ? pattern.rating : 0,
          updatedAt
        });
      }
    }
  }
}

export async function fetchRecapData(
  nickname: string,
  rangeStart: Date,
  rangeEnd?: Date
): Promise<RecapResult> {
  const combos = BUTTONS.flatMap((button) =>
    BOARDS.map((board) => ({ button, board }))
  );

  const collector: RecordCollector = {
    recordMap: new Map(),
    patternKeys: new Set(),
    clearedPatternKeys: new Set()
  };

  await promisePool(
    combos,
    async ({ button, board }) => {
      const boardResponse = await fetchBoard(nickname, button, board);
      collectRecordsFromBoard(boardResponse, rangeStart, rangeEnd, collector);
    },
    6
  );

  const records = Array.from(collector.recordMap.values());
  const totalPatterns = collector.patternKeys.size;
  const totalClearedPatterns = collector.clearedPatternKeys.size;
  const stats = deriveRecapStats(records, [...BUTTONS]);

  const tiers: Record<number, TierResponse | null> = {};
  const tierResponses = await Promise.all(
    BUTTONS.map((button) => fetchTier(nickname, button))
  );
  BUTTONS.forEach((button, index) => {
    tiers[button] = tierResponses[index] ?? null;
  });

  return {
    nickname,
    rangeStartISO: rangeStart.toISOString(),
    stats,
    tiers,
    totalPatterns,
    totalClearedPatterns
  };
}

/**
 * 닉네임이 V-Archive에 존재하는지 빠르게 확인합니다.
 * 4버튼 티어 API를 호출해서 확인합니다.
 */
export async function checkNicknameExists(nickname: string): Promise<boolean> {
  try {
    await api.get(
      `/api/archive/${encodeURIComponent(nickname)}/tier/4`,
      { headers: jsonHeaders }
    );
    return true;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const code = (error.response?.data as { errorCode?: number } | undefined)
        ?.errorCode;
      if (code === 101) {
        return false;
      }
      // code 111은 티어가 없는 경우로, 닉네임은 존재함
      if (code === 111) {
        return true;
      }
    }
    // 다른 에러의 경우 일단 통과시킴
    return true;
  }
}
