import { useQuery, type QueryKey, type UseQueryOptions } from "@tanstack/react-query";
import apiClient from "@/utils/httpClient";

export function useApiQuery<TData = unknown>(
  key: QueryKey,
  url: string,
  options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">
) {
  return useQuery<TData>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await apiClient.get<TData>(url);
      return data;
    },
    ...options,
  });
}
