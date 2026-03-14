import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { isUuid } from "@/lib/utils";
import { patientUpdateSchema } from "@/types/schemas";
import type { Patient } from "@/types/healthiq";

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
    .from("patients")
    .select(
      "id, org_id, mrn, first_name, last_name, dob, gender, phone, email, address, insurance_id, pcp_id, is_active, created_at, updated_at"
    )
    .eq("id", normalizedId)
    .single();

  if (error) return sendError(error.message, 500);
  if (!data) return sendError("Patient not found", 404);

  return sendSuccess<Patient>(data as Patient);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);
  const paramsData = await Promise.resolve(params);
  const rawId = paramsData.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const normalizedId = typeof id === "string" ? decodeURIComponent(id).trim() : "";
  if (!isUuid(normalizedId)) return sendError("Invalid patient id", 400);

  const parsed = patientUpdateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return sendError("Validation failed", 400, parsed.error.flatten());
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .update({
      ...parsed.data,
    })
    .eq("id", normalizedId)
    .select(
      "id, org_id, mrn, first_name, last_name, dob, gender, phone, email, address, insurance_id, pcp_id, is_active, created_at, updated_at"
    )
    .single();

  if (error) return sendError(error.message, 500);
  if (!data) return sendError("Patient not found", 404);

  return sendSuccess<Patient>(data as Patient, 200, { message: "Patient updated." });
}
