import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { taskCreateSchema } from "@/types/schemas";
import type { Task } from "@/types/healthiq";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const assigneeId = searchParams.get("assignee_id");
  const priority = searchParams.get("priority");
  const dueDate = searchParams.get("due_date");
  const search = searchParams.get("search");
  const limitParam = searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam ?? "200"), 1), 200);

  let query = (await createClient())
    .from("tasks")
    .select(
      "id, patient_id, assigned_to, created_by, org_id, title, description, task_type, priority, status, due_date, completed_at, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);
  if (assigneeId) query = query.eq("assigned_to", assigneeId);
  if (priority) query = query.eq("priority", priority);
  if (dueDate) query = query.eq("due_date", dueDate);
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) return sendError(error.message, 500);

  return sendSuccess<Task[]>((data ?? []) as Task[]);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = taskCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return sendError("Validation failed", 400, parsed.error.flatten());
  }

  const profile = auth.profile;
  if (!profile?.org_id) return sendError("Profile missing org_id", 400);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      org_id: profile.org_id,
      patient_id: parsed.data.patient_id ?? null,
      title: parsed.data.title.trim(),
      description: parsed.data.description ?? null,
      task_type: parsed.data.task_type ?? null,
      priority: parsed.data.priority ?? "medium",
      status: "pending",
      due_date: parsed.data.due_date ?? null,
      assigned_to: parsed.data.assigned_to ?? auth.user.id,
      created_by: auth.user.id,
    })
    .select(
      "id, patient_id, assigned_to, created_by, org_id, title, description, task_type, priority, status, due_date, completed_at, created_at"
    )
    .single();

  if (error) return sendError(error.message, 500);

  return sendSuccess<Task>(data as Task, 201, { message: "Task created." });
}
