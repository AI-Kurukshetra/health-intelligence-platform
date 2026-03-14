import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { CarePlan, Patient, PatientCondition } from "@/types/healthiq";
import type { PatientCreateValues, PatientUpdateValues } from "@/types/schemas";

type PatientFilters = {
  page?: number;
  limit?: number;
  risk_tier?: string;
  condition_code?: string;
  search?: string;
};

function toQueryString(filters?: PatientFilters) {
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

export function usePatients(filters?: PatientFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.patients.all, filters ?? {}],
    queryFn: () => apiGet<Patient[]>(`/patients${toQueryString(filters)}`),
  });
}

export function usePatientSearch(term: string, limit = 5, enabled = true) {
  const trimmed = term.trim();
  return useQuery({
    queryKey: [QUERY_KEYS.patients.all, "search", trimmed, limit],
    queryFn: () =>
      apiGet<Patient[]>(
        `/patients?search=${encodeURIComponent(trimmed)}&limit=${limit}`
      ),
    enabled: enabled && trimmed.length >= 2,
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.patients.detail(id),
    queryFn: () => apiGet<Patient>(`/patients/${id}`),
    enabled: Boolean(id),
  });
}

export function usePatientRisk(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.patients.risk(id),
    queryFn: () => apiGet(`/patients/${id}/risk`),
    enabled: Boolean(id),
  });
}

export function usePatientGaps(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.patients.gaps(id),
    queryFn: () => apiGet(`/patients/${id}/gaps`),
    enabled: Boolean(id),
  });
}

export function usePatientConditions(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.patients.conditions(id),
    queryFn: () => apiGet<PatientCondition[]>(`/patients/${id}/conditions`),
    enabled: Boolean(id),
  });
}

export function usePatientCarePlans(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.patients.carePlans(id),
    queryFn: () => apiGet<CarePlan[]>(`/patients/${id}/care-plans`),
    enabled: Boolean(id),
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PatientCreateValues) => apiPost<Patient>("/patients", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.patients.all }),
  });
}

export function useUpdatePatient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PatientUpdateValues) => apiPatch<Patient>(`/patients/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.patients.all }),
  });
}
