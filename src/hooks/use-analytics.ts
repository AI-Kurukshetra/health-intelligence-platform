import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { KpiSummary, QualityMeasure } from "@/types/healthiq";

export function useKpis() {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.kpis,
    queryFn: () => apiGet<KpiSummary>("/analytics/kpis"),
  });
}

export function useQualityMeasures() {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.qualityMeasures,
    queryFn: () => apiGet<QualityMeasure[]>("/analytics/quality-measures"),
  });
}
