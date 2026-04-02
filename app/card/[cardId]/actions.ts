"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface StampRecord {
  id: string;
  created_at: string;
}

export async function getStampHistory(cardId: string): Promise<StampRecord[]> {
  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("stamps")
    .select("id, created_at")
    .eq("card_id", cardId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) return [];

  return data as StampRecord[];
}
