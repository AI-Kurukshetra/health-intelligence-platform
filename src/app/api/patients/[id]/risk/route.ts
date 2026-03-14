import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { isUuid } from "@/lib/utils";
import type { RiskScore } from "@/types/healthiq";

type RouteParams = { params: { id: string } | Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);
  const paramsData = await Promise.resolve(params);
  const rawId = paramsData.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const normalizedId = typeof id === "string" ? decodeURIComponent(id).trim() : "";
  if (!isUuid(normalizedId)) return sendError("Invalid patient id", 400);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("risk_scores")
    .select("id, patient_id, score, risk_tier, risk_factors, model_version, calculated_at")
    .eq("patient_id", normalizedId)
    .order("calculated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return sendError(error.message, 500);

  return sendSuccess<RiskScore | null>((data ?? null) as RiskScore | null);
}
