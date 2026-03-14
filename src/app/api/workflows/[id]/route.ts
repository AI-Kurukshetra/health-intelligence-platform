import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { workflowUpdateSchema } from "@/types/schemas";
import type { Workflow } from "@/types/healthiq";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);
  const { id } = await context.params;

  const parsed = workflowUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workflows")
    .update({
      ...parsed.data,
    })
    .eq("id", id)
    .select("id, org_id, name, trigger_type, trigger_config, actions, is_active, created_at")
    .single();

  if (error) return sendError(error.message, 500);
  if (!data) return sendError("Workflow not found", 404);

  return sendSuccess<Workflow>(data as Workflow, 200, { message: "Workflow updated." });
}
