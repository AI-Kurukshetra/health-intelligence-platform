import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import type { RiskScore } from "@/types/healthiq";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patient_id");
  const riskTier = searchParams.get("risk_tier");

  let query = (await createClient())
    .from("risk_scores")
    .select("id, patient_id, score, risk_tier, risk_factors, model_version, calculated_at")
    .order("calculated_at", { ascending: false });

  if (patientId) query = query.eq("patient_id", patientId);
  if (riskTier) query = query.eq("risk_tier", riskTier);

  const { data, error } = await query;
  if (error) return sendError(error.message, 500);

  return sendSuccess<RiskScore[]>((data ?? []) as RiskScore[]);
}
