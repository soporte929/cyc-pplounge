"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { registerCustomerSchema } from "@/lib/validations/customer";

export async function registerCustomer(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    marketing_consent: formData.get("marketing_consent") === "true",
  };

  const parsed = registerCustomerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false as const,
      error: "validation_error" as const,
      fields: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, marketing_consent } = parsed.data;
  const supabase = await createServiceClient();

  // Check if email already exists (generic error, don't reveal data)
  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return {
      success: false as const,
      error: "email_exists" as const,
    };
  }

  // Create customer
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({ name, email, marketing_consent })
    .select("id")
    .single();

  if (customerError || !customer) {
    return {
      success: false as const,
      error: "db_error" as const,
    };
  }

  // Get active reward for the cycle
  const { data: activeReward } = await supabase
    .from("rewards")
    .select("id")
    .eq("is_active", true)
    .single();

  // Create loyalty card
  const { data: card, error: cardError } = await supabase
    .from("loyalty_cards")
    .insert({
      customer_id: customer.id,
      active_reward_id: activeReward?.id ?? null,
    })
    .select("id")
    .single();

  if (cardError || !card) {
    return {
      success: false as const,
      error: "db_error" as const,
    };
  }

  return {
    success: true as const,
    cardId: card.id,
  };
}
