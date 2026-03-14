import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { workflowCreateSchema } from "@/types/schemas";
import type { Workflow } from "@/types/healthiq";

export async function GET() {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { data, error } = await (await createClient())
    .from("workflows")
    .select("id, org_id, name, trigger_type, trigger_config, actions, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) return sendError(error.message, 500);
  return sendSuccess<Workflow[]>((data ?? []) as Workflow[]);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = workflowCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const profile = auth.profile;
  if (!profile?.org_id) return sendError("Profile missing org_id", 400);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workflows")
    .insert({
      org_id: profile.org_id,
      name: parsed.data.name.trim(),
      trigger_type: parsed.data.trigger_type,
      trigger_config: parsed.data.trigger_config ?? null,
      actions: parsed.data.actions ?? null,
      is_active: parsed.data.is_active ?? true,
    })
    .select("id, org_id, name, trigger_type, trigger_config, actions, is_active, created_at")
    .single();

  if (error) return sendError(error.message, 500);
  return sendSuccess<Workflow>(data as Workflow, 201, { message: "Workflow created." });
}
