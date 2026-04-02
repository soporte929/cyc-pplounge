import { createServiceClient } from "@/lib/supabase/server";

export async function verifyAdmin() {
  const supabase = await createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false as const, error: "not_authenticated" as const };
  }

  const { data: staffRecord } = await supabase
    .from("staff")
    .select("id, role, is_active")
    .eq("user_id", user.id)
    .single();

  if (!staffRecord || staffRecord.role !== "admin") {
    return { authorized: false as const, error: "forbidden" as const };
  }

  if (!staffRecord.is_active) {
    return { authorized: false as const, error: "staff_inactive" as const };
  }

  return {
    authorized: true as const,
    staffId: staffRecord.id,
    supabase,
  };
}
