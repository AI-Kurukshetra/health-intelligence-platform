import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/constants/roles";

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, full_name, email, avatar_url, org_id, role_id, role:roles(name)")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("[auth] getProfile failed", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return null;
  }
  if (!data) return null;

  let profile = data;
  let roleName = (profile.role as { name?: string } | null)?.name ?? null;

  if (!profile.org_id || !profile.role_id || !roleName) {
    const [{ data: org }, { data: role }] = await Promise.all([
      supabase
        .from("organizations")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase.from("roles").select("id, name").eq("name", "care_manager").maybeSingle(),
    ]);

    const updates: { org_id?: string; role_id?: string } = {};
    if (!profile.org_id && org?.id) updates.org_id = org.id;
    if (!profile.role_id && role?.id) updates.role_id = role.id;

    if (Object.keys(updates).length > 0) {
      const { data: updated, error: updateError } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", userId)
        .select("id, full_name, email, avatar_url, org_id, role_id, role:roles(name)")
        .maybeSingle();

      if (updateError) {
        console.error("[auth] bootstrap profile failed", {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code,
        });
      } else if (updated) {
        profile = updated;
        roleName = (updated.role as { name?: string } | null)?.name ?? roleName;
      }
    }
  }

  const safeRole = roleName ?? "care_manager";

  return {
    ...profile,
    role: safeRole,
  };
}

export async function getCurrentUserWithProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error("[auth] getUser failed", {
      message: error.message,
      status: error.status,
      name: error.name,
    });
  }
  if (!user) return { user: null, profile: null };
  const profile = await getProfile(user.id);
  return { user, profile };
}

export async function requireAuth() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user) return null;
  return { user, profile };
}

export async function requireRole(allowedRoles: Role[]) {
  const data = await requireAuth();
  if (!data) return null;
  const role = (data.profile?.role ?? "care_manager") as Role;
  if (!allowedRoles.includes(role)) return null;
  return data;
}
