import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { taskUpdateSchema } from "@/types/schemas";
import type { Task } from "@/types/healthiq";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);
  const { id } = await context.params;

  const parsed = taskUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return sendError("Validation failed", 400, parsed.error.flatten());
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({
      ...parsed.data,
    })
    .eq("id", id)
    .select(
      "id, patient_id, assigned_to, created_by, org_id, title, description, task_type, priority, status, due_date, completed_at, created_at"
    )
    .single();

  if (error) return sendError(error.message, 500);
  if (!data) return sendError("Task not found", 404);

  return sendSuccess<Task>(data as Task, 200, { message: "Task updated." });
}
