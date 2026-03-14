import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import type { QualityMeasure } from "@/types/healthiq";

export async function GET() {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { data, error } = await (await createClient())
    .from("quality_measures")
    .select(
      "id, org_id, measure_code, measure_name, numerator, denominator, rate, period_start, period_end, calculated_at"
    )
    .order("measure_code", { ascending: true });

  if (error) return sendError(error.message, 500);
  return sendSuccess<QualityMeasure[]>((data ?? []) as QualityMeasure[]);
}
