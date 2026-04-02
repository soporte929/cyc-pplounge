"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { redeemRewardSchema } from "@/lib/validations/stamp";

export async function redeemReward(cardId: string) {
  const parsed = redeemRewardSchema.safeParse({ cardId });
  if (!parsed.success) {
    return { success: false as const, error: "validation_error" as const };
  }

  const supabase = await createServiceClient();

  // Verify staff is authenticated and active
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false as const, error: "not_authenticated" as const };
  }

  const { data: staffRecord } = await supabase
    .from("staff")
    .select("id, is_active")
    .eq("user_id", user.id)
    .single();

  if (!staffRecord) {
    return { success: false as const, error: "staff_not_found" as const };
  }

  if (!staffRecord.is_active) {
    await supabase.auth.signOut();
    return { success: false as const, error: "staff_inactive" as const };
  }

  // Call RPC to redeem reward atomically
  const { data, error } = await supabase.rpc("redeem_reward", {
    p_card_id: parsed.data.cardId,
    p_staff_id: staffRecord.id,
  });

  if (error) {
    return { success: false as const, error: "db_error" as const };
  }

  const result = data as {
    success: boolean;
    error?: string;
    stamps_remaining?: number;
    cycle_completed?: number;
    reward_redeemed?: string;
    stamps_current?: number;
    stamps_required?: number;
  };

  if (!result.success) {
    return {
      success: false as const,
      error: result.error as string,
      stamps_current: result.stamps_current,
      stamps_required: result.stamps_required,
    };
  }

  return {
    success: true as const,
    stamps_remaining: result.stamps_remaining!,
    cycle_completed: result.cycle_completed!,
    reward_redeemed: result.reward_redeemed!,
  };
}
