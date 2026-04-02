import { createServiceClient } from "@/lib/supabase/server";

export interface DashboardMetrics {
  totalCustomers: number;
  stampsToday: number;
  stampsWeek: number;
  stampsMonth: number;
  rewardsRedeemed: number;
  activeCustomers: number;
  conversionRate: number;
  avgCycleTime: number;
  inactiveCustomers: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createServiceClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const inactiveThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Total customers
  const { count: totalCustomers } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true });

  // Stamps today
  const { count: stampsToday } = await supabase
    .from("stamps")
    .select("id", { count: "exact", head: true })
    .gte("created_at", todayStart);

  // Stamps this week
  const { count: stampsWeek } = await supabase
    .from("stamps")
    .select("id", { count: "exact", head: true })
    .gte("created_at", weekAgo);

  // Stamps this month
  const { count: stampsMonth } = await supabase
    .from("stamps")
    .select("id", { count: "exact", head: true })
    .gte("created_at", monthAgo);

  // Rewards redeemed total
  const { count: rewardsRedeemed } = await supabase
    .from("redemptions")
    .select("id", { count: "exact", head: true });

  // Active customers (had a stamp in last 30 days)
  const { data: activeData } = await supabase
    .from("stamps")
    .select("card_id")
    .gte("created_at", monthAgo);
  const activeCustomers = new Set(activeData?.map((s) => s.card_id)).size;

  // Onboarding conversion rate
  // Total customers vs total loyalty cards (customers who completed onboarding)
  const { count: totalCards } = await supabase
    .from("loyalty_cards")
    .select("id", { count: "exact", head: true });
  const conversionRate = totalCustomers && totalCustomers > 0
    ? Math.round(((totalCards ?? 0) / totalCustomers) * 100)
    : 0;

  // Average cycle time (days between card creation and first redemption)
  const { data: redemptionData } = await supabase
    .from("redemptions")
    .select("card_id, redeemed_at, loyalty_cards(created_at)")
    .order("redeemed_at", { ascending: true });

  let avgCycleTime = 0;
  if (redemptionData && redemptionData.length > 0) {
    const cycleTimes = redemptionData
      .filter((r) => {
        const card = r.loyalty_cards as unknown as { created_at: string } | null;
        return card?.created_at;
      })
      .map((r) => {
        const card = r.loyalty_cards as unknown as { created_at: string };
        const created = new Date(card.created_at).getTime();
        const redeemed = new Date(r.redeemed_at!).getTime();
        return (redeemed - created) / (1000 * 60 * 60 * 24);
      });
    avgCycleTime = cycleTimes.length > 0
      ? Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length)
      : 0;
  }

  // Inactive customers (no stamp in last 30 days, but have a card)
  const { data: allCards } = await supabase
    .from("loyalty_cards")
    .select("id, is_active")
    .eq("is_active", true);

  const activeCardIds = new Set(activeData?.map((s) => s.card_id));
  const inactiveCustomers = (allCards ?? []).filter(
    (c) => !activeCardIds.has(c.id)
  ).length;

  return {
    totalCustomers: totalCustomers ?? 0,
    stampsToday: stampsToday ?? 0,
    stampsWeek: stampsWeek ?? 0,
    stampsMonth: stampsMonth ?? 0,
    rewardsRedeemed: rewardsRedeemed ?? 0,
    activeCustomers,
    conversionRate,
    avgCycleTime,
    inactiveCustomers,
  };
}
