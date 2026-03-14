import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { CareGap } from "@/types/healthiq";
import type { CareGapUpdateValues } from "@/types/schemas";

export function useCareGaps(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return useQuery({
    queryKey: [QUERY_KEYS.careGaps.all, status ?? "all"],
    queryFn: () => apiGet<CareGap[]>(`/care-gaps${query}`),
  });
}

export function useUpdateCareGap(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CareGapUpdateValues) =>
      apiPatch<CareGap>(`/care-gaps/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.careGaps.all }),
  });
}
