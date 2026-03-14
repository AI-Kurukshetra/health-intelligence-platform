import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import type { CareGap } from "@/types/healthiq";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = (await createClient())
    .from("care_gaps")
    .select(
      "id, patient_id, gap_type, description, due_date, status, closed_at, closed_by, created_at"
    )
    .order("due_date", { ascending: true })
    .limit(200);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return sendError(error.message, 500);

  return sendSuccess<CareGap[]>((data ?? []) as CareGap[]);
}
