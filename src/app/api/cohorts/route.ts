import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { sendError, sendSuccess } from "@/lib/utils/api";
import { cohortCreateSchema } from "@/types/schemas";
import type { Cohort } from "@/types/healthiq";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const limitParam = searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam ?? "200"), 1), 200);

  let query = (await createClient())
    .from("cohorts")
    .select("id, org_id, name, description, filter_config, patient_count, created_by, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) return sendError(error.message, 500);
  return sendSuccess<Cohort[]>((data ?? []) as Cohort[]);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth) return sendError("Unauthorized", 401);

  const parsed = cohortCreateSchema.safeParse(await request.json());
  if (!parsed.success) return sendError("Validation failed", 400, parsed.error.flatten());

  const profile = auth.profile;
  if (!profile?.org_id) return sendError("Profile missing org_id", 400);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cohorts")
    .insert({
      org_id: profile.org_id,
      name: parsed.data.name.trim(),
      description: parsed.data.description ?? null,
      filter_config: parsed.data.filter_config ?? null,
      created_by: auth.user.id,
    })
    .select("id, org_id, name, description, filter_config, patient_count, created_by, created_at")
    .single();

  if (error) return sendError(error.message, 500);
  return sendSuccess<Cohort>(data as Cohort, 201, { message: "Cohort created." });
}
