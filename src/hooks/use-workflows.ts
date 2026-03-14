import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { Workflow } from "@/types/healthiq";
import type { WorkflowCreateValues, WorkflowUpdateValues } from "@/types/schemas";

export function useWorkflows() {
  return useQuery({
    queryKey: QUERY_KEYS.workflows.all,
    queryFn: () => apiGet<Workflow[]>("/workflows"),
  });
}

export function useCreateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkflowCreateValues) => apiPost<Workflow>("/workflows", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.workflows.all }),
  });
}

export function useUpdateWorkflow(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkflowUpdateValues) =>
      apiPatch<Workflow>(`/workflows/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.workflows.all }),
  });
}
