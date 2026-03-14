import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { careGapUpdateSchema } from "@/types/schemas";
import type { CareGap } from "@/types/healthiq";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);
  const { id } = await context.params;

  const parsed = careGapUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return sendError("Validation failed", 400, parsed.error.flatten());
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("care_gaps")
    .update({
      status: parsed.data.status,
      closed_by: parsed.data.closed_by ?? null,
      closed_at: parsed.data.closed_at ?? null,
    })
    .eq("id", id)
    .select(
      "id, patient_id, gap_type, description, due_date, status, closed_at, closed_by, created_at"
    )
    .single();

  if (error) return sendError(error.message, 500);
  if (!data) return sendError("Care gap not found", 404);

  return sendSuccess<CareGap>(data as CareGap, 200, { message: "Care gap updated." });
}
