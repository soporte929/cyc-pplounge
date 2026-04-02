import { verifyAdmin } from "@/lib/auth/verify-admin";
import { revalidatePath } from "next/cache";
import { StaffClient } from "./staff-client";
import { createServiceClient } from "@/lib/supabase/server";

async function createStaff(formData: FormData) {
  "use server";
  const auth = await verifyAdmin();
  if (!auth.authorized) return;
  const supabase = auth.supabase;

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "staff";

  if (!name || !email || !password || password.length < 6) return;

  // Create Supabase Auth user with password
  const { data: userData, error: userError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

  if (userError || !userData?.user) {
    console.error("Create user error:", userError);
    return;
  }

  // Insert staff record linked to the auth user
  await supabase.from("staff").insert({
    user_id: userData.user.id,
    email,
    name,
    role,
    is_active: true,
  });

  revalidatePath("/staff");
}

async function toggleStaffActive(formData: FormData) {
  "use server";
  const auth = await verifyAdmin();
  if (!auth.authorized) return;
  const supabase = auth.supabase;

  const id = formData.get("id") as string;
  const currentActive = formData.get("currentActive") === "true";

  await supabase
    .from("staff")
    .update({ is_active: !currentActive })
    .eq("id", id);

  revalidatePath("/staff");
}

async function changeRole(formData: FormData) {
  "use server";
  const auth = await verifyAdmin();
  if (!auth.authorized) return;
  const supabase = auth.supabase;

  const id = formData.get("id") as string;
  const role = formData.get("role") as string;

  await supabase.from("staff").update({ role }).eq("id", id);

  revalidatePath("/staff");
}

export default async function StaffPage() {
  const supabase = await createServiceClient();

  // Get current user to prevent self-actions
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: currentStaff } = await supabase
    .from("staff")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  const { data: staff } = await supabase
    .from("staff")
    .select("id, name, email, role, is_active, created_at")
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-headline font-extrabold uppercase tracking-tighter text-[#e5e2e1]">
            Gestión Staff
          </h1>
          <p className="mt-1 text-sm text-[#d0c5b2]">
            {staff?.length ?? 0} miembro{staff?.length !== 1 ? "s" : ""} del equipo
          </p>
        </div>
      </div>

      <StaffClient
        staff={staff ?? []}
        currentUserId={currentStaff?.id ?? ""}
        createStaff={createStaff}
        toggleStaffActive={toggleStaffActive}
        changeRole={changeRole}
      />
    </div>
  );
}
