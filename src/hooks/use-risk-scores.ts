import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { RiskScore } from "@/types/healthiq";
import type { RiskScoreTriggerValues } from "@/types/schemas";

export function useRiskScores(patientId?: string) {
  const query = patientId ? `?patient_id=${encodeURIComponent(patientId)}` : "";
  return useQuery({
    queryKey: [QUERY_KEYS.riskScores.all, patientId ?? "all"],
    queryFn: () => apiGet<RiskScore[]>(`/risk-scores${query}`),
  });
}

export function useTriggerRiskScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RiskScoreTriggerValues) =>
      apiPost<RiskScore>("/risk-scores/score", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.riskScores.all }),
  });
}
