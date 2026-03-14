import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { Cohort } from "@/types/healthiq";
import type { CohortCreateValues } from "@/types/schemas";

type CohortFilters = {
  search?: string;
  limit?: number;
};

function toQueryString(filters?: CohortFilters) {
  if (!filters) return "";
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function useCohorts(filters?: CohortFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.cohorts.all, filters ?? {}],
    queryFn: () => apiGet<Cohort[]>(`/cohorts${toQueryString(filters)}`),
  });
}

export function useCohortSearch(term: string, limit = 5, enabled = true) {
  const trimmed = term.trim();
  return useQuery({
    queryKey: [QUERY_KEYS.cohorts.all, "search", trimmed, limit],
    queryFn: () =>
      apiGet<Cohort[]>(
        `/cohorts?search=${encodeURIComponent(trimmed)}&limit=${limit}`
      ),
    enabled: enabled && trimmed.length >= 2,
  });
}

export function useCreateCohort() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CohortCreateValues) => apiPost<Cohort>("/cohorts", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.cohorts.all }),
  });
}
