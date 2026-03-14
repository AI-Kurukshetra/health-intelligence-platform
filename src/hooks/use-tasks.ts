import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { Task } from "@/types/healthiq";
import type { TaskCreateValues, TaskUpdateValues } from "@/types/schemas";

type TaskFilters = {
  status?: string;
  assignee_id?: string;
  priority?: string;
  due_date?: string;
  search?: string;
  limit?: number;
};

function toQueryString(filters?: TaskFilters) {
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

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.tasks.all, filters ?? {}],
    queryFn: () => apiGet<Task[]>(`/tasks${toQueryString(filters)}`),
  });
}

export function useTaskSearch(term: string, limit = 5, enabled = true) {
  const trimmed = term.trim();
  return useQuery({
    queryKey: [QUERY_KEYS.tasks.all, "search", trimmed, limit],
    queryFn: () =>
      apiGet<Task[]>(
        `/tasks?search=${encodeURIComponent(trimmed)}&limit=${limit}`
      ),
    enabled: enabled && trimmed.length >= 2,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskCreateValues) => apiPost<Task>("/tasks", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.all }),
  });
}

export function useUpdateTask(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskUpdateValues) => apiPatch<Task>(`/tasks/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.all }),
  });
}
