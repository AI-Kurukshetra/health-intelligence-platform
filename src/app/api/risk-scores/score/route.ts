import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { riskScoreTriggerSchema } from "@/types/schemas";
import type { RiskScore } from "@/types/healthiq";

const CACHE_WINDOW_HOURS = 24;

function calculateAge(dob: string | null): number {
  if (!dob) return 50;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Math.max(age, 0);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = riskScoreTriggerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return sendError("Validation failed", 400, parsed.error.flatten());
  }

  const supabase = await createClient();

  const { data: latest, error: latestError } = await supabase
    .from("risk_scores")
    .select("id, patient_id, score, risk_tier, risk_factors, model_version, calculated_at")
    .eq("patient_id", parsed.data.patient_id)
    .order("calculated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) return sendError(latestError.message, 500);

  if (latest?.calculated_at) {
    const ageHours =
      (Date.now() - new Date(latest.calculated_at).getTime()) / (1000 * 60 * 60);
    if (ageHours < CACHE_WINDOW_HOURS) {
      return sendSuccess<RiskScore>(latest as RiskScore, 200, {
        message: "Using cached risk score.",
      });
    }
  }

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id, dob")
    .eq("id", parsed.data.patient_id)
    .single();

  if (patientError) return sendError(patientError.message, 500);
  if (!patient) return sendError("Patient not found", 404);

  const { data: conditions, error: conditionError } = await supabase
    .from("patient_conditions")
    .select("id")
    .eq("patient_id", patient.id);

  if (conditionError) return sendError(conditionError.message, 500);

  const age = calculateAge(patient.dob ?? null);
  const conditionCount = conditions?.length ?? 0;
  const score = Math.min(95, Math.max(5, age + conditionCount * 8));
  const riskTier = score >= 70 ? "high" : score >= 40 ? "medium" : "low";

  const { data, error } = await supabase
    .from("risk_scores")
    .insert({
      patient_id: patient.id,
      score,
      risk_tier: riskTier,
      risk_factors: [
        { factor: "Age", weight: "medium", description: `Age ${age}` },
        { factor: "Conditions", weight: "high", description: `${conditionCount} conditions` },
      ],
      model_version: "deterministic-v1",
    })
    .select("id, patient_id, score, risk_tier, risk_factors, model_version, calculated_at")
    .single();

  if (error) return sendError(error.message, 500);

  return sendSuccess<RiskScore>(data as RiskScore, 201, { message: "Risk score created." });
}
