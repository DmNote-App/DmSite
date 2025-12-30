import { useQuery } from "@tanstack/react-query";
import { fetchRecapData, type RecapResult } from "@/lib/varchive";

export const recapQueryKeys = {
  all: ["recap"] as const,
  detail: (nickname: string, rangeLabel: string) =>
    [...recapQueryKeys.all, nickname, rangeLabel] as const,
};

interface UseRecapQueryOptions {
  nickname: string;
  rangeStart: Date;
  rangeEnd?: Date;
  rangeLabel: string;
  enabled?: boolean;
}

export function useRecapQuery({
  nickname,
  rangeStart,
  rangeEnd,
  rangeLabel,
  enabled = true,
}: UseRecapQueryOptions) {
  return useQuery<RecapResult>({
    queryKey: recapQueryKeys.detail(nickname, rangeLabel),
    queryFn: () => fetchRecapData(nickname, rangeStart, rangeEnd),
    enabled: Boolean(nickname) && enabled,
    staleTime: 5 * 60 * 1000, // 5분간 데이터를 fresh로 유지 (재요청 방지)
    gcTime: 30 * 60 * 1000, // 30분간 캐시 유지
  });
}
