import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import type { KpiSummary } from "@/types/healthiq";

export async function GET() {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ count: totalPatients, error: totalError },
    { count: highRisk, error: highRiskError },
    { count: openGaps, error: openGapsError },
    { count: closedGaps, error: closedGapsError },
    { count: tasksDueToday, error: tasksError }] = await Promise.all([
    supabase.from("patients").select("id", { count: "exact", head: true }),
    supabase.from("risk_scores").select("id", { count: "exact", head: true }).eq("risk_tier", "high"),
    supabase.from("care_gaps").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("care_gaps").select("id", { count: "exact", head: true }).eq("status", "closed"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("due_date", today),
  ]);

  const errors = [totalError, highRiskError, openGapsError, closedGapsError, tasksError].filter(Boolean);
  if (errors.length > 0) {
    return sendError("Failed to load KPIs", 500, errors.map((e) => e?.message));
  }

  const closed = closedGaps ?? 0;
  const open = openGaps ?? 0;
  const closureRate = closed + open > 0 ? (closed / (closed + open)) * 100 : 0;

  const payload: KpiSummary = {
    total_patients: totalPatients ?? 0,
    high_risk_patients: highRisk ?? 0,
    open_care_gaps: open,
    care_gap_closure_rate: Number(closureRate.toFixed(2)),
    tasks_due_today: tasksDueToday ?? 0,
  };

  return sendSuccess<KpiSummary>(payload);
}
