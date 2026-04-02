"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { addStampSchema } from "@/lib/validations/stamp";
import { sendStampEmail, sendRewardReadyEmail } from "@/lib/email/resend";

export async function addStamp(cardId: string) {
  const parsed = addStampSchema.safeParse({ cardId });
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

  // Call RPC to add stamp atomically
  const { data, error } = await supabase.rpc("add_stamp", {
    p_card_id: parsed.data.cardId,
    p_staff_id: staffRecord.id,
  });

  if (error) {
    return { success: false as const, error: "db_error" as const };
  }

  const result = data as {
    success: boolean;
    error?: string;
    stamps_current?: number;
    reward_unlocked?: boolean;
    reward_name?: string;
    minutes_remaining?: number;
  };

  if (!result.success) {
    return {
      success: false as const,
      error: result.error as string,
      minutes_remaining: result.minutes_remaining,
    };
  }

  // Send emails (non-blocking)
  try {
    // Get customer email for notifications
    const { data: card } = await supabase
      .from("loyalty_cards")
      .select("customer_id")
      .eq("id", parsed.data.cardId)
      .single();

    if (card) {
      const { data: customer } = await supabase
        .from("customers")
        .select("email, name")
        .eq("id", card.customer_id)
        .single();

      if (customer) {
        // Get actual stamps_required from the card's active reward
        const { data: cardWithReward } = await supabase
          .from("loyalty_cards")
          .select("active_reward_id, rewards(stamps_required)")
          .eq("id", parsed.data.cardId)
          .single();

        const rewardData = cardWithReward?.rewards as unknown as { stamps_required: number } | null;
        const actualRequired = rewardData?.stamps_required ?? 10;

        await sendStampEmail(customer.email, customer.name, result.stamps_current!, actualRequired);

        // Also send reward email if unlocked
        if (result.reward_unlocked && result.reward_name) {
          await sendRewardReadyEmail(customer.email, customer.name, result.reward_name);
        }
      }
    }
  } catch {
    // Email errors are non-blocking
    console.error("Failed to send notification emails");
  }

  return {
    success: true as const,
    stamps_current: result.stamps_current!,
    reward_unlocked: result.reward_unlocked ?? false,
    reward_name: result.reward_name,
  };
}

export async function getCardInfo(cardId: string) {
  const supabase = await createServiceClient();

  // Verify staff is authenticated before returning card data
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("loyalty_cards")
    .select("id, stamps_current, is_active, customers(name), rewards(name, stamps_required)")
    .eq("id", cardId)
    .single();

  if (!data) return null;

  const customer = data.customers as unknown as { name: string } | null;
  const reward = data.rewards as unknown as { name: string; stamps_required: number } | null;

  return {
    cardId: data.id,
    customerName: customer?.name ?? "Cliente",
    stampsCurrent: data.stamps_current,
    stampsRequired: reward?.stamps_required ?? 10,
    rewardName: reward?.name ?? null,
    isActive: data.is_active,
  };
}
