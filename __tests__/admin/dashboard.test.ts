import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase with chainable query builder
function createChain(data: unknown) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.gte = vi.fn().mockReturnValue(chain);
  chain.lte = vi.fn().mockReturnValue(chain);
  chain.gt = vi.fn().mockReturnValue(chain);
  chain.lt = vi.fn().mockReturnValue(chain);
  chain.not = vi.fn().mockReturnValue(chain);
  chain.is = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue({ data, error: null, count: null });
  chain.then = undefined; // prevent thenable detection
  return chain;
}

function createCountChain(count: number) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.gte = vi.fn().mockReturnValue(chain);
  chain.lte = vi.fn().mockReturnValue(chain);
  chain.gt = vi.fn().mockReturnValue(chain);
  chain.lt = vi.fn().mockReturnValue(chain);
  chain.not = vi.fn().mockReturnValue(chain);
  chain.is = vi.fn().mockReturnValue(chain);
  // Resolve as { count, data, error }
  (chain as Record<string, unknown>).__count = count;
  return { ...chain, then: (resolve: (v: unknown) => void) => resolve({ count, data: null, error: null }) };
}

let fromCallIndex = 0;
let fromResults: ReturnType<typeof createChain>[] = [];

const mockSupabase = {
  from: vi.fn(() => {
    const chain = fromResults[fromCallIndex] || createChain(null);
    fromCallIndex++;
    return chain;
  }),
};

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

import { getDashboardMetrics } from "@/app/(admin)/dashboard/metrics";

describe("getDashboardMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fromCallIndex = 0;
    fromResults = [];
  });

  it("should return total customers count", async () => {
    fromResults = [
      createChain({ count: 150 }), // total customers
      createChain({ count: 48 }),  // stamps today
      createChain({ count: 12 }),  // rewards redeemed
      createChain({ count: 80 }),  // active customers
      createChain({ onboarding_rate: 0.73 }), // conversion
      createChain({ avg_days: 14 }), // avg cycle time
      createChain({ count: 20 }),  // inactive customers
    ];

    const metrics = await getDashboardMetrics();
    expect(metrics).toHaveProperty("totalCustomers");
  });

  it("should return stamps count for the period", async () => {
    fromResults = Array(7).fill(null).map(() => createChain({ count: 10 }));
    const metrics = await getDashboardMetrics();
    expect(metrics).toHaveProperty("stampsToday");
  });

  it("should return rewards redeemed count", async () => {
    fromResults = Array(7).fill(null).map(() => createChain({ count: 10 }));
    const metrics = await getDashboardMetrics();
    expect(metrics).toHaveProperty("rewardsRedeemed");
  });

  it("should return active customers count", async () => {
    fromResults = Array(7).fill(null).map(() => createChain({ count: 10 }));
    const metrics = await getDashboardMetrics();
    expect(metrics).toHaveProperty("activeCustomers");
  });

  it("should return onboarding conversion rate", async () => {
    fromResults = Array(7).fill(null).map(() => createChain({ count: 10 }));
    const metrics = await getDashboardMetrics();
    expect(metrics).toHaveProperty("conversionRate");
  });

  it("should return average cycle time", async () => {
    fromResults = Array(7).fill(null).map(() => createChain({ count: 10 }));
    const metrics = await getDashboardMetrics();
    expect(metrics).toHaveProperty("avgCycleTime");
  });

  it("should return inactive customers count", async () => {
    fromResults = Array(7).fill(null).map(() => createChain({ count: 10 }));
    const metrics = await getDashboardMetrics();
    expect(metrics).toHaveProperty("inactiveCustomers");
  });
});
