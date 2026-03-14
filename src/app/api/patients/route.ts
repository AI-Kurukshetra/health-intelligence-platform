import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { patientCreateSchema } from "@/types/schemas";
import type { Patient } from "@/types/healthiq";

function normalizeQueryParam(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "20"), 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const riskTier = normalizeQueryParam(searchParams.get("risk_tier"));
  const conditionCode = normalizeQueryParam(searchParams.get("condition_code"));
  const search = normalizeQueryParam(searchParams.get("search"));

  let filteredPatientIds: string[] | null = null;

  if (riskTier) {
    const { data, error } = await supabase
      .from("risk_scores")
      .select("patient_id")
      .eq("risk_tier", riskTier);
    if (error) return sendError(error.message, 500);
    filteredPatientIds = (data ?? []).map((row) => row.patient_id);
  }

  if (conditionCode) {
    const { data, error } = await supabase
      .from("patient_conditions")
      .select("patient_id")
      .eq("icd10_code", conditionCode);
    if (error) return sendError(error.message, 500);
    const ids = (data ?? []).map((row) => row.patient_id);
    filteredPatientIds = filteredPatientIds
      ? filteredPatientIds.filter((id) => ids.includes(id))
      : ids;
  }

  if (filteredPatientIds && filteredPatientIds.length === 0) {
    return sendSuccess<Patient[]>([], 200, {
      metadata: {
        pagination: { page, limit, total: 0, totalPages: 0 },
      },
    });
  }

  let query = supabase
    .from("patients")
    .select(
      "id, org_id, mrn, first_name, last_name, dob, gender, phone, email, address, insurance_id, pcp_id, is_active, created_at, updated_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filteredPatientIds) {
    query = query.in("id", filteredPatientIds);
  }

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;
  if (error) return sendError(error.message, 500);

  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

  return sendSuccess<Patient[]>((data ?? []) as Patient[], 200, {
    metadata: {
      pagination: { page, limit, total, totalPages },
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = patientCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return sendError("Validation failed", 400, parsed.error.flatten());
  }

  const profile = auth.profile;
  if (!profile?.org_id) {
    return sendError("Profile missing org_id", 400);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .insert({
      org_id: profile.org_id,
      first_name: parsed.data.first_name.trim(),
      last_name: parsed.data.last_name.trim(),
      dob: parsed.data.dob ?? null,
      gender: parsed.data.gender ?? null,
      phone: parsed.data.phone ?? null,
      email: parsed.data.email ?? null,
    })
    .select(
      "id, org_id, mrn, first_name, last_name, dob, gender, phone, email, address, insurance_id, pcp_id, is_active, created_at, updated_at"
    )
    .single();

  if (error) return sendError(error.message, 500);
  return sendSuccess<Patient>(data as Patient, 201, { message: "Patient created." });
}
