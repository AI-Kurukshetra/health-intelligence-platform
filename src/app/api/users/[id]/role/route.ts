import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { sendSuccess, sendError } from "@/lib/utils/api";
import { updateUserRoleSchema } from "@/types/schemas";
import { ROLES } from "@/constants/roles";
import type { UserListItem } from "@/types/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireRole([ROLES.ORG_ADMIN, ROLES.SUPER_ADMIN]);
  if (!auth) {
    return sendError("Forbidden", 403);
  }

  const { id } = await context.params;

  const parsed = updateUserRoleSchema.safeParse(await request.json());
  if (!parsed.success) {
    return sendError("Validation failed", 400, parsed.error.flatten());
  }

  const { role } = parsed.data;

  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("user_profiles")
    .select("id, email, full_name, avatar_url, created_at, role:roles(name)")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return sendError("User not found", 404);
  }

  const { data: roleRecord, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", role)
    .single();

  if (roleError || !roleRecord) {
    return sendError("Role not found", 400);
  }

  const { error: updateError, data } = await supabase
    .from("user_profiles")
    .update({ role_id: roleRecord.id })
    .eq("id", id)
    .select("id, email, full_name, avatar_url, created_at, role:roles(name)")
    .single();

  if (updateError) {
    return sendError(updateError.message, 500);
  }

  const payload: UserListItem = {
    id: data.id,
    email: data.email ?? null,
    full_name: data.full_name ?? null,
    avatar_url: data.avatar_url ?? null,
    role: (data.role as { name?: string } | null)?.name ?? "care_manager",
    created_at: data.created_at,
  };

  return sendSuccess<UserListItem>(payload, 200, {
    message: "User role updated.",
  });
}

