import { verifyAdmin } from "@/lib/auth/verify-admin";
import { revalidatePath } from "next/cache";
import { RewardsClient } from "./rewards-client";
import { createServiceClient } from "@/lib/supabase/server";

async function createReward(formData: FormData) {
  "use server";
  const auth = await verifyAdmin();
  if (!auth.authorized) return;
  const supabase = auth.supabase;

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const stamps_required = parseInt(formData.get("stamps_required") as string, 10);

  await supabase
    .from("rewards")
    .insert({ name, description, stamps_required, is_active: false });

  revalidatePath("/rewards");
}

async function updateReward(formData: FormData) {
  "use server";
  const auth = await verifyAdmin();
  if (!auth.authorized) return;
  const supabase = auth.supabase;

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const stamps_required = parseInt(formData.get("stamps_required") as string, 10);

  await supabase
    .from("rewards")
    .update({ name, description, stamps_required })
    .eq("id", id);

  revalidatePath("/rewards");
}

async function toggleRewardActive(formData: FormData) {
  "use server";
  const auth = await verifyAdmin();
  if (!auth.authorized) return;
  const supabase = auth.supabase;

  const id = formData.get("id") as string;
  const currentActive = formData.get("currentActive") === "true";

  // The DB trigger enforces single-active-reward constraint
  await supabase
    .from("rewards")
    .update({ is_active: !currentActive })
    .eq("id", id);

  revalidatePath("/rewards");
}

export default async function RewardsPage() {
  const supabase = await createServiceClient();

  const { data: rewards } = await supabase
    .from("rewards")
    .select("id, name, description, stamps_required, is_active")
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-headline font-extrabold uppercase tracking-tighter text-[#e5e2e1]">
            Rewards Portal
          </h1>
          <p className="mt-1 text-sm text-[#d0c5b2]">
            {rewards?.length ?? 0} reward{rewards?.length !== 1 ? "s" : ""} configured
          </p>
        </div>
      </div>

      {/* Client grid + form drawers */}
      <RewardsClient
        rewards={rewards ?? []}
        createReward={createReward}
        updateReward={updateReward}
        toggleRewardActive={toggleRewardActive}
      />
    </div>
  );
}
